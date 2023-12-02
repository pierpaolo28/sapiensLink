from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models import Q, Count, Sum
from django.contrib.auth import authenticate, login, logout
from .models import *
from .forms import *
from django.core.paginator import Paginator
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync, sync_to_async
from rest_framework_simplejwt.tokens import RefreshToken
import uuid
from django.utils import timezone

# Create your views here.
LISTS_PER_PAGE = 20

def loginPage(request):
    page = 'login'
    # TODO: Check if this if statement is necessary or not in REST API login_user
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
    all_lists = List.objects.filter(public=True).distinct()
    all_list_count = all_lists.count()
    all_topics = Topic.objects.filter(name__icontains=q)
    # Filtering the topics where public=True at least once
    topics = [topic for topic in all_topics if all_lists.filter(topic=topic).exists()]

    # Creating the topic counts dictionary for the filtered topics
    topic_counts = {topic.name: all_lists.filter(topic=topic).count() for topic in topics}

    filtered_topic_counts = {key: topic_counts[key] for key in topic_counts if key in [topic.name for topic in topics]}

    sorted_topic_counts = sorted(filtered_topic_counts.items(), key=lambda item: item[1], reverse=True)

    lists = all_lists.filter(
        Q(topic__name__icontains=q) |
        Q(name__icontains=q) |
        Q(description__icontains=q) | 
        Q(content__icontains=q)
    )

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

    context = {'page': page, 'users': users,
               'list_count': list_count, 'topic_counts': sorted_topic_counts,
               'all_list_count': all_list_count}
    return render(request, 'pages/home.html', context)


def rank_home(request, top_voted='top_voted_false'):
    q = request.GET.get('q') if request.GET.get('q') != None else ''
    all_ranks = Rank.objects.distinct()
    all_rank_count = all_ranks.count()
    topics = RankTopic.objects.filter(name__icontains=q)

    # Creating the topic counts dictionary for the filtered topics
    topic_counts = {topic.name: all_ranks.filter(topic=topic).count() for topic in topics}

    filtered_topic_counts = {key: topic_counts[key] for key in topic_counts if key in [topic.name for topic in topics]}

    sorted_topic_counts = sorted(filtered_topic_counts.items(), key=lambda item: item[1], reverse=True)

    ranks = all_ranks.filter(
        Q(topic__name__icontains=q) |
        Q(name__icontains=q) |
        Q(description__icontains=q) | 
        Q(content__icontains=q)
    )

    rank_count = ranks.count()
    
    if top_voted=='top_voted_true':
        ranks = ranks.order_by('-score')

    # Create a paginator instance
    paginator = Paginator(ranks, LISTS_PER_PAGE)
    
    # Get the current page number from the request's GET parameters
    page_number = request.GET.get('page')

    # Get the Page object for the current page
    page = paginator.get_page(page_number)

    context = {'page': page, 
               'rank_count': rank_count, 'topic_counts': sorted_topic_counts,
               'all_rank_count': all_rank_count}
    return render(request, 'pages/rank_home.html', context)


def index(request):
    return render(request, 'pages/index.html')


@sync_to_async
def list(request, pk):
    list = List.objects.get(id=pk)
    comment_form = CommentForm()
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
            comment_form = CommentForm(request.POST)
            if comment_form.is_valid():
                comment = comment_form.save(commit=False)
                comment.user = request.user
                comment.list = list
                comment.save()

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

    context = {'list': list, 'list_comments': list_comments, 'comment_form': comment_form,
               'participants': participants, 'has_reported': has_reported, 
               'saved_list_ids': saved_list_ids}
    return render(request, 'pages/list.html', context)


@sync_to_async
def rank(request, pk):
    rank = Rank.objects.get(id=pk)
    contributors = rank.contributors.all()
    user = request.user
    # Check if the user has already reported this rank
    if user.is_authenticated:
        has_reported = RankReport.objects.filter(user=user, rank=rank).exists()
        saved_rank_ids = RankSaved.objects.filter(user=request.user).values_list('rank_id', flat=True)
    else:
        has_reported = False
        saved_rank_ids = []

    if request.method == 'POST':
        if 'element' in request.POST:

            # Combine timestamp and random component for uniqueness
            unique_id = f"{timezone.now().isoformat()}-{uuid.uuid4()}"

            # Update the content dictionary
            rank.content[unique_id] = {
                'element': request.POST['element'],
                'user_id': user.id
            }
            rank.save()

            rank.contributors.add(request.user)

            for receiver in rank.contributors.all():
                if receiver != request.user:
                    # Sending notification to the WebSocket group
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        "notifications_group",
                        {
                            'type': 'send_notification',
                            'notification': f'A new element was added on the rank "{rank.name}".',
                            'creator_id': user.id,
                            'receiver_id': receiver.id,
                            'url': request.build_absolute_uri()
                        }
                    )

            return redirect('rank', pk=rank.id)
        elif 'save' in request.POST:
            RankSaved.objects.get_or_create(user=request.user, rank=rank)
            return redirect('rank', pk=rank.id)
        elif 'unsave' in request.POST:
            saved_rank = get_object_or_404(RankSaved, user=request.user, rank=rank)
            saved_rank.delete()
            return redirect('rank', pk=rank.id)
        
    content_scores = {}
    for index in rank.content:
        votes = RankVote.objects.filter(rank=rank, content_index=index)
        upvotes = votes.filter(action='upvote').count()
        downvotes = votes.filter(action='downvote').count()
        score = upvotes - downvotes
        content_scores[index] = score

    context = {'rank': rank,
               'contributors': contributors, 'has_reported': has_reported, 
               'saved_rank_ids': saved_rank_ids, 
               'content_scores': content_scores}
    return render(request, 'pages/rank.html', context)


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


@login_required(login_url='login')
def vote_rank(request, pk, content_index, action):
    rank = get_object_or_404(Rank, pk=pk)
    user = request.user

    try:
        vote = RankVote.objects.get(user=user, rank=rank, content_index=content_index)

        if vote.action == action:
            return redirect('../../../../rank/' + pk)
        elif vote.action in ['upvote', 'downvote']:
            vote.action = 'neutral'
        else:
            vote.action = action

        vote.save()

    except RankVote.DoesNotExist:
        if action in ['upvote', 'downvote']:
            RankVote.objects.create(user=user, rank=rank, content_index=content_index, action=action)

    if action == 'upvote':
        rank.score += 1
    elif action == 'downvote':
        rank.score -= 1

    rank.save()

    return redirect('../../../../rank/' + pk)


def userProfile(request, pk):
    user = User.objects.get(id=pk)
    lists_count = List.objects.filter(author_id = pk, public=True).count()
    lists = user.list_set.filter(public=True)
    list_comments = user.comment_set.all()
    saved_lists = SavedList.objects.filter(user=user)
    saved_ranks = RankSaved.objects.filter(user=user)
    lists_contributions = EditSuggestion.objects.filter(suggested_by=pk, is_accepted=True).order_by('-id')[:3]
    ranks_contributions = user.contributors.all().order_by('-updated')[:3]

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
                "lists_count": lists_count,
                'page': page,
                'list_comments': list_comments, 
                "is_following": is_following,
                'saved_lists': saved_lists,
                'saved_ranks': saved_ranks,
                'lists_contributions': lists_contributions,
                'ranks_contributions': ranks_contributions,
            }
            current_user_profile.save()
            return render(request, 'pages/profile.html', context)
    context = {
        "user": user,
        "lists_count": lists_count,
        'page': page,
        'list_comments': list_comments, 
        'is_following': is_following,
        'saved_lists': saved_lists,
        'saved_ranks': saved_ranks,
        'lists_contributions': lists_contributions,
        'ranks_contributions': ranks_contributions,
    }
    return render(request, 'pages/profile.html', context)


@login_required(login_url='login')
def private_lists(request, pk):
    user = User.objects.get(id=pk)
    lists_count = List.objects.filter(author_id = pk, public=True).count()
    private_lists = user.list_set.filter(public=False)
    list_comments = user.comment_set.all()
    saved_lists = SavedList.objects.filter(user=user)
    saved_ranks = RankSaved.objects.filter(user=user)

    # Create a paginator instance
    paginator = Paginator(private_lists, LISTS_PER_PAGE)
    
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
                "lists_count": lists_count,
                'page': page,
                'list_comments': list_comments, 
                "is_following": is_following,
                'saved_lists': saved_lists,
                'saved_ranks': saved_ranks,
            }
            current_user_profile.save()
            return render(request, 'pages/private_lists.html', context)
    context = {
        "user": user,
        "lists_count": lists_count,
        'page': page,
        'list_comments': list_comments, 
        'is_following': is_following,
        'saved_lists': saved_lists,
        'saved_ranks': saved_ranks,
    }
    return render(request, 'pages/private_lists.html', context)


@login_required(login_url='login')
def createList(request):
    form = ListForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        list_instance = form.save(commit=False)
        list_instance.author = request.user
        list_instance.save()
        # Assuming you want to create Topic instances for the selected topics
        for topic_name in form.cleaned_data['topic']:
            topic, created = Topic.objects.get_or_create(name=topic_name)
            list_instance.topic.add(topic)
        # Don't forget to handle other ManyToMany fields like 'participants' if necessary
        list_instance.participants.add(request.user)
        list_instance.save()
        return redirect('home')

    context = {'form': form}
    return render(request, 'pages/list_form.html', context)


@login_required(login_url='login')
def createRank(request):
    form = RankForm(request.POST or None, request=request)
    if request.method == 'POST' and form.is_valid():
        rank_instance = form.save(commit=False)
        rank_instance.save()
        # Assuming you want to create Topic instances for the selected topics
        for topic_name in form.cleaned_data['topic']:
            topic, created = RankTopic.objects.get_or_create(name=topic_name)
            rank_instance.topic.add(topic)
        # Don't forget to handle other ManyToMany fields like 'contributors' if necessary
        rank_instance.contributors.add(request.user)
        rank_instance.save()
        return redirect('rank_home')

    context = {'form': form}
    return render(request, 'pages/rank_form.html', context)


@login_required(login_url='login')
def updateList(request, pk):
    list_instance = get_object_or_404(List, id=pk)
    if request.user != list_instance.author:
        return HttpResponse('You are not authorized to edit this list.')

    form = ListForm(instance=list_instance)

    # Pre-populate the topics field with the current topics of the list
    if request.method == 'GET':
        # Get the list of topic names that are currently associated with this list
        initial_topics = list_instance.topic.values_list('name', flat=True)
        # The initial topics must be set as a list of topic names, not objects
        form.fields['topic'].initial = [name for name in initial_topics]

    if request.method == 'POST':
        form = ListForm(request.POST, instance=list_instance)
        if form.is_valid():
            list_instance = form.save(commit=False)
            list_instance.save()
            # Clear existing topics
            list_instance.topic.clear()
            # Get the list of topic names from the POST data
            topic_names = request.POST.getlist('topic')
            # Add new topics
            for topic_name in topic_names:
                topic, created = Topic.objects.get_or_create(name=topic_name)
                list_instance.topic.add(topic)

            return redirect('home')

    context = {'form': form, 'list': list_instance}
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
    
    all_lists = List.objects.filter(public=True)
    all_topics = Topic.objects.filter(name__icontains=q)
    all_list_count = all_lists.count()
    # Filtering the topics where public=True at least once
    topics = [topic for topic in all_topics if all_lists.filter(topic=topic).exists()]

    # Creating the topic counts dictionary for the filtered topics
    topic_counts = {topic.name: all_lists.filter(topic=topic).count() for topic in topics}

    filtered_topic_counts = {key: topic_counts[key] for key in topic_counts if key in [topic.name for topic in topics]}

    sorted_topic_counts = sorted(filtered_topic_counts.items(), key=lambda item: item[1], reverse=True)

    return render(request, 'pages/topics.html', {'topic_counts': sorted_topic_counts,
                                                 'all_list_count': all_list_count})


def rankTopicsPage(request):
    q = request.GET.get('q') if request.GET.get('q') != None else ''
    
    all_ranks = Rank.objects.all()
    all_topics = RankTopic.objects.filter(name__icontains=q)
    all_rank_count = all_ranks.count()

    # Creating the topic counts dictionary for the filtered topics
    topic_counts = {topic.name: all_ranks.filter(topic=topic).count() for topic in all_topics}

    filtered_topic_counts = {key: topic_counts[key] for key in topic_counts if key in [topic.name for topic in all_topics]}

    sorted_topic_counts = sorted(filtered_topic_counts.items(), key=lambda item: item[1], reverse=True)

    return render(request, 'pages/rank_topics.html', {'topic_counts': sorted_topic_counts,
                                                      'all_rank_count': all_rank_count})


def whoToFollowPage(request):
    q = request.GET.get('q') if request.GET.get('q') != None else ''
    users = User.objects.filter(name__icontains=q).annotate(followers_count=Count('followers')).order_by('-followers_count')
    return render(request, 'pages/who_to_follow.html', {'users': users})


def custom_404(request, exception):
    # TODO: For Django API configuration decide if handling 404 request on frontend or backend
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
def report_rank(request, pk):
    # Retrieve the back_url parameter from GET parameters
    back_url = request.GET.get('back_url')
    rank = get_object_or_404(Rank, id=pk)
    if request.method == 'POST':
        form = ReportRankForm(request.POST)
        if form.is_valid():
            report = form.save(commit=False)
            report.rank = rank
            report.user = request.user
            report.save()
            return redirect(back_url)
    else:
        form = ReportRankForm()

    return render(request, 'pages/report_rank.html', {'form': form, 'rank': rank})


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
    saved_ranks = RankSaved.objects.filter(user=user).filter(rank__name__icontains=q)
    return render(request, 'pages/saved_lists.html', {'saved_lists': saved_lists,
                                                      'saved_ranks': saved_ranks})