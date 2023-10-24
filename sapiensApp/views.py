from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models import Q, Count
from django.contrib.auth import authenticate, login, logout
from .models import List, Topic, Comment, User, Vote, Report, Feedback, EditSuggestion, EditComment, SavedList
from .forms import ListForm, UserForm, MyUserCreationForm, ReportForm, EditSuggestionForm, EditCommentForm
from django.core.paginator import Paginator
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync, sync_to_async
from rest_framework_simplejwt.tokens import RefreshToken

# Create your views here.
LISTS_PER_PAGE = 20

def loginPage(request):
    page = 'login'
    if request.user.is_authenticated:
        token = request.session["refresh_token"]
        try:
            RefreshToken(token)
            return redirect('home')
        except:
            logout(request)

    if request.method == 'POST':
        email = request.POST.get('email').lower()
        password = request.POST.get('password')

        try:
            user = User.objects.get(email=email)
        except:
            messages.error(request, 'User does not exist')

        user = authenticate(request, email=email, password=password)

        if user is not None:
            login(request, user)
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            request.session["access_token"] = access_token
            request.session["refresh_token"] = str(refresh)
            request.session["expiration_time"] = refresh.access_token['exp'] * 1000 # Convert expiration time to milliseconds
            return redirect('home')
        else:
            messages.error(request, 'Email OR password does not exit')

    context = {'page': page}
    return render(request, 'pages/login_register.html', context)


def logoutUser(request):
    logout(request)
    return redirect('index')


def registerPage(request):
    form = MyUserCreationForm()

    if request.method == 'POST':
        form = MyUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.email = user.email.lower()
            user.save()
            login(request, user)
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            request.session["access_token"] = access_token
            request.session["refresh_token"] = str(refresh)
            request.session["expiration_time"] = refresh.access_token['exp'] * 1000 # Convert expiration time to milliseconds
            return redirect('home')
        else:
            messages.error(request, 'An error occurred during registration')

    return render(request, 'pages/login_register.html', {'form': form})


def home(request, follow='follow_false', top_voted='top_voted_false'):
    q = request.GET.get('q') if request.GET.get('q') != None else ''

    lists = List.objects.filter(
        Q(topic__name__icontains=q) |
        Q(name__icontains=q) |
        Q(content__icontains=q)
    )

    topics = Topic.objects.annotate(names_count=Count('name')).order_by('-names_count')
    users = User.objects.annotate(followers_count=Count('followers')).order_by('-followers_count')[0:5]
    list_count = lists.count()
    
    if follow=='follow_true':
        f_list = request.user.following.all()
        lists = lists.filter(
                    author__in=f_list
                )
        list_count = lists.count()
    elif top_voted=='top_voted_true':
        lists = lists.order_by('-score')

    # Create a paginator instance
    paginator = Paginator(lists, LISTS_PER_PAGE)
    
    # Get the current page number from the request's GET parameters
    page_number = request.GET.get('page')

    # Get the Page object for the current page
    page = paginator.get_page(page_number)

    context = {'page': page, 'topics': topics, 'users': users,
               'list_count': list_count}
    return render(request, 'pages/home.html', context)


def index(request):
    return render(request, 'pages/index.html')


@sync_to_async
def list(request, pk):
    list = List.objects.get(id=pk)
    list_comments = list.comment_set.all()
    participants = list.participants.all()
    user = request.user
    # Check if the user has already reported this list
    if user.is_authenticated:
        has_reported = Report.objects.filter(user=user, list=list).exists()
        saved_list_ids = SavedList.objects.filter(user=request.user).values_list('list_id', flat=True)
    else:
        has_reported = False
        saved_list_ids = []

    if request.method == 'POST':
        if 'comment' in request.POST:
            Comment.objects.create(
                user=request.user,
                list=list,
                body=request.POST.get('comment')
            )
            list.participants.add(request.user)

            for receiver in list.participants.all():
                if receiver != request.user:
                    # Sending notification to the WebSocket group
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        "notifications_group",
                        {
                            'type': 'send_notification',
                            'notification': f'A new comment was added on the list "{list.name}".',
                            'creator_id': user.id,
                            'receiver_id': receiver.id,
                            'url': request.build_absolute_uri()
                        }
                    )

            return redirect('list', pk=list.id)
        elif 'save' in request.POST:
            SavedList.objects.get_or_create(user=request.user, list=list)
            return redirect('list', pk=list.id)
        elif 'unsave' in request.POST:
            saved_list = get_object_or_404(SavedList, user=request.user, list=list)
            saved_list.delete()
            return redirect('list', pk=list.id)

    context = {'list': list, 'list_comments': list_comments,
               'participants': participants, 'has_reported': has_reported, 
               'saved_list_ids': saved_list_ids}
    return render(request, 'pages/list.html', context)


@login_required(login_url='login')
def vote(request, pk, action):
    list = get_object_or_404(List, pk=pk)
    user = request.user
    try:
        vote = Vote.objects.get(user=user, list=list)
        if vote.action == action:
            return redirect('../../../list/' + pk)
        elif vote.action == 'upvote' or vote.action == 'downvote':
            vote.action = 'neutral'
            vote.save()
        else:
            vote.action = action
            vote.save()
    except Vote.DoesNotExist:
        if action in ('upvote', 'downvote'):
            Vote.objects.create(user=user, list=list, action=action)
    if action == 'upvote':
        list.score += 1
    elif action == 'downvote':
        list.score -= 1
    list.save()
    return redirect('../../../list/' + pk)


def userProfile(request, pk):
    user = User.objects.get(id=pk)
    lists_count = List.objects.filter(author_id = pk).count()
    lists = user.list_set.all()
    list_comments = user.comment_set.all()
    topics = Topic.objects.annotate(names_count=Count('name')).order_by('-names_count')
    users = User.objects.annotate(followers_count=Count('followers')).order_by('-followers_count')[0:5]
    saved_lists = SavedList.objects.filter(user=user)

    # Create a paginator instance
    paginator = Paginator(lists, LISTS_PER_PAGE)
    
    # Get the current page number from the request's GET parameters
    page_number = request.GET.get('page')

    # Get the Page object for the current page
    page = paginator.get_page(page_number)

    if request.user.is_authenticated:
        if request.user.following.filter(pk=pk).exists():
            is_following = True
        else:
            is_following = False
    else:
        is_following = False
    if request.method == "POST":
        current_user_profile = request.user
        if pk != request.user.id:
            if request.user.following.filter(pk=pk).exists():
                current_user_profile.following.remove(user)
                is_following = False
            else:
                current_user_profile.following.add(user)
                is_following = True
            context = {
                "user": user,
                "users": users,
                "lists_count": lists_count,
                'page': page,
                'list_comments': list_comments, 
                'topics': topics,
                "is_following": is_following,
                'saved_lists': saved_lists,
            }
            current_user_profile.save()
            return render(request, 'pages/profile.html', context)
    context = {
        "user": user,
        "users": users,
        "lists_count": lists_count,
        'page': page,
        'list_comments': list_comments, 
        'topics': topics,
        'is_following': is_following,
        'saved_lists': saved_lists,
    }
    return render(request, 'pages/profile.html', context)


@login_required(login_url='login')
def createList(request):
    form = ListForm()
    topics = ["Economics", "Finance", "Management", "Tech", "Education"]
    if request.method == 'POST':
        topic_name = request.POST.get('topic')
        if topic_name in topics:
            topic, created = Topic.objects.get_or_create(name=topic_name)
        else:
            return HttpResponse('The provided topic is not valid, only dropdown options are available.')

        list = List.objects.create(
            author=request.user,
            topic=topic,
            name=request.POST.get('name'),
            content=request.POST.get('content'),
            source=request.POST.get('source'),
        )
        list.participants.add(request.user)

        return redirect('home')

    context = {'form': form, 'topics': topics}
    return render(request, 'pages/list_form.html', context)


@login_required(login_url='login')
def updateList(request, pk):
    list = List.objects.get(id=pk)
    form = ListForm(instance=list)
    topics = Topic.objects.all()
    if request.user != list.author:
        return HttpResponse('Not authorized to proceed.')

    if request.method == 'POST':
        topic_name = request.POST.get('topic')
        topic, created = Topic.objects.get_or_create(name=topic_name)
        list.name = request.POST.get('name')
        list.topic = topic
        list.content = request.POST.get('content')
        list.source = request.POST.get('source')
        list.save()
        return redirect('home')

    context = {'form': form, 'topics': topics, 'list': list}
    return render(request, 'pages/list_form.html', context)


@login_required(login_url='login')
def deleteList(request, pk):
    list = List.objects.get(id=pk)

    if request.user != list.author:
        return HttpResponse('Not authorized to proceed.')

    if request.method == 'POST':
        list.delete()
        return redirect('home')
    return render(request, 'pages/delete.html', {'obj': list})


@login_required(login_url='login')
def deleteComment(request, pk):
    comment = Comment.objects.get(id=pk)

    if request.user != comment.user:
        return HttpResponse('Not authorized to proceed.')

    if request.method == 'POST':
        comment.delete()
        return redirect('home')
    return render(request, 'pages/delete.html', {'obj': comment})


@login_required(login_url='login')
def updateUser(request):
    user = request.user
    form = UserForm(instance=user)

    if request.method == 'POST':
        form = UserForm(request.POST, request.FILES, instance=user)
        password = request.POST.get('password')
        if form.is_valid():
            form.save()
            if password:
                user.set_password(password)
                user.save()
            return redirect('profile', pk=user.id)
        else:
            if password:
                user.set_password(password)
                user.save()
            return redirect('profile', pk=user.id)

    return render(request, 'pages/update_user.html', {'form': form})


def topicsPage(request):
    q = request.GET.get('q') if request.GET.get('q') != None else ''
    topics = Topic.objects.filter(name__icontains=q).annotate(names_count=Count('name')).order_by('-names_count')
    return render(request, 'pages/topics.html', {'topics': topics})


def whoToFollowPage(request):
    q = request.GET.get('q') if request.GET.get('q') != None else ''
    users = User.objects.filter(name__icontains=q).annotate(followers_count=Count('followers')).order_by('-followers_count')
    return render(request, 'pages/who_to_follow.html', {'users': users})


def custom_404(request, exception):
    return render(request, 'pages/404.html', status=404)


@login_required(login_url='login')
def report_list(request, pk):
    # Retrieve the back_url parameter from GET parameters
    back_url = request.GET.get('back_url')
    list = get_object_or_404(List, id=pk)
    if request.method == 'POST':
        form = ReportForm(request.POST)
        if form.is_valid():
            report = form.save(commit=False)
            report.list = list
            report.user = request.user
            report.save()
            # Sending notification to the WebSocket group
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "notifications_group",
                {
                    'type': 'send_notification',
                    'notification': f'Your list "{list.name}" has been reported by an user.',
                    'creator_id': request.user.id,
                    'receiver_id': list.author.id,
                    'url': request.build_absolute_uri('/') + 'list/' + str(list.id) + '/',
                }
            )
            return redirect(back_url)
    else:
        form = ReportForm()

    return render(request, 'pages/report.html', {'form': form, 'list': list})


@login_required(login_url='login')
def delete_account(request):
    if request.method == 'POST':
        password = request.POST.get('password')
        confirm_delete = request.POST.get('confirm_delete')
        feedback = request.POST.get('feedback')
        Feedback.objects.create(
            feedback=feedback
        )

        user = authenticate(request, email=request.user.email, password=password)

        if user is not None and confirm_delete == 'on':
            # Delete the user account
            user.delete()
            logout(request)
            messages.success(request, 'Your account has been deleted.')
            return redirect('home')
        else:
            messages.error(request, 'Invalid password or confirmation.')
    return render(request, 'pages/delete_account.html')


@login_required(login_url='login')
def list_pr(request, pk):
    list = get_object_or_404(List, id=pk)
    suggestions = EditSuggestion.objects.filter(list=list, is_accepted=False)
    pr_comments = EditComment.objects.filter(edit_suggestion__list=list)
    
    edit_suggestion_form = EditSuggestionForm()
    comment_form = EditCommentForm()
    
    if request.method == 'POST':
        if 'edit_suggestion' in request.POST:
            edit_suggestion_form = EditSuggestionForm(request.POST)
            if edit_suggestion_form.is_valid():
                suggestion = edit_suggestion_form.save(commit=False)
                suggestion.list = list
                suggestion.suggested_by = request.user
                suggestion.save()
                # Sending notification to the WebSocket group
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    "notifications_group",
                    {
                        'type': 'send_notification',
                        'notification': f'A new suggestion to edit your list "{list.name}" has been created.',
                        'creator_id': request.user.id,
                        'receiver_id': list.author.id,
                        'url': request.build_absolute_uri(),
                    }
                )
        elif 'comment' in request.POST:
            comment_form = EditCommentForm(request.POST)
            if comment_form.is_valid():
                comment = comment_form.save(commit=False)
                comment.edit_suggestion = EditSuggestion.objects.get(pk=request.POST['edit_suggestion_id'])
                comment.commenter = request.user
                comment.save()
                # Sending notification to the WebSocket group
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    "notifications_group",
                    {
                        'type': 'send_notification',
                        'notification': f'A new comment has been added to a suggestion to edit your list "{list.name}".',
                        'creator_id': request.user.id,
                        'receiver_id': list.author.id,
                        'url': request.build_absolute_uri(),
                    }
                )
    
    return render(request, 'pages/list_pr.html', {'list': list, 'suggestions': suggestions, 'pr_comments': pr_comments, 'edit_suggestion_form': edit_suggestion_form, 'comment_form': comment_form})


@login_required(login_url='login')
def approve_suggestion(request, suggestion_id):
    suggestion = get_object_or_404(EditSuggestion, id=suggestion_id)
    # Check if the current user is the author of the list
    if suggestion.list.author == request.user or request.user.is_superuser:
        suggestion.is_accepted = True
        suggestion.save()

        list = suggestion.list
        list.content = suggestion.suggestion_text
        list.save()
        # Sending notification to the WebSocket group
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "notifications_group",
            {
                'type': 'send_notification',
                'notification': f'Your suggestion to edit the list "{list.name}" has been approved!',
                'creator_id': request.user.id,
                'receiver_id': suggestion.suggested_by.id,
                'url': request.build_absolute_uri('/') + 'list/' + str(suggestion.list.id) + '/',
            }
        )

    return redirect('list_pr', pk=suggestion.list.id)


@login_required(login_url='login')
def decline_suggestion(request, suggestion_id):
    suggestion = get_object_or_404(EditSuggestion, id=suggestion_id)
    # Check if the current user is the author of the list
    if suggestion.list.author == request.user or request.user.is_superuser:
        suggestion.delete()
        # Sending notification to the WebSocket group
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "notifications_group",
            {
                'type': 'send_notification',
                'notification': f'Your suggestion to edit the list "{suggestion.list.name}" has been declined.',
                'creator_id': request.user.id,
                'receiver_id': suggestion.suggested_by.id,
                'url': request.build_absolute_uri('/') + 'list/' + str(suggestion.list.id) + '/',
            }
        )

    return redirect('list_pr', pk=suggestion.list.id)


@login_required(login_url='login')
def delete_pr_comment(request, comment_id):
    back_url = request.GET.get('back_url')

    comment = get_object_or_404(EditComment, id=comment_id)

    # Check if the current user is the author of the comment
    if comment.commenter == request.user:
        comment.delete()

    return redirect(back_url)


def savedListsPage(request, pk):
    q = request.GET.get('q') if request.GET.get('q') != None else ''
    user = User.objects.get(id=pk)
    saved_lists = SavedList.objects.filter(user=user).filter(list__name__icontains=q)
    return render(request, 'pages/saved_lists.html', {'saved_lists': saved_lists})