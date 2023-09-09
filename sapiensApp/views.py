from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.contrib.auth import authenticate, login, logout
from .models import List, Topic, Message, User
from .forms import ListForm, UserForm, MyUserCreationForm

# Create your views here.

def loginPage(request):
    page = 'login'
    if request.user.is_authenticated:
        return redirect('home')

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
            return redirect('home')
        else:
            messages.error(request, 'Email OR password does not exit')

    context = {'page': page}
    return render(request, 'pages/login_register.html', context)


def logoutUser(request):
    logout(request)
    return redirect('home')


def registerPage(request):
    form = MyUserCreationForm()

    if request.method == 'POST':
        form = MyUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.email = user.email.lower()
            user.save()
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, 'An error occurred during registration')

    return render(request, 'pages/login_register.html', {'form': form})


def home(request):
    q = request.GET.get('q') if request.GET.get('q') != None else ''

    lists = List.objects.filter(
        Q(topic__name__icontains=q) |
        Q(name__icontains=q) |
        Q(content__icontains=q)
    )

    topics = Topic.objects.all()[0:5]
    list_count = lists.count()
    list_messages = Message.objects.filter(
        Q(list__topic__name__icontains=q))[0:3]

    context = {'lists': lists, 'topics': topics,
               'list_count': list_count, 'list_messages': list_messages}
    return render(request, 'pages/home.html', context)


def list(request, pk):
    list = List.objects.get(id=pk)
    list_messages = list.message_set.all()
    participants = list.participants.all()

    if request.method == 'POST':
        message = Message.objects.create(
            user=request.user,
            list=list,
            body=request.POST.get('body')
        )
        list.participants.add(request.user)
        return redirect('list', pk=list.id)

    context = {'list': list, 'list_messages': list_messages,
               'participants': participants}
    return render(request, 'pages/list.html', context)


def userProfile(request, pk):
    user = User.objects.get(id=pk)
    lists = user.list_set.all()
    list_messages = user.message_set.all()
    topics = Topic.objects.all()
    context = {'user': user, 'lists': lists,
               'list_messages': list_messages, 'topics': topics}
    return render(request, 'pages/profile.html', context)


@login_required(login_url='login')
def createList(request):
    form = ListForm()
    topics = Topic.objects.all()
    if request.method == 'POST':
        topic_name = request.POST.get('topic')
        topic, created = Topic.objects.get_or_create(name=topic_name)

        List.objects.create(
            host=request.user,
            topic=topic,
            name=request.POST.get('name'),
            content=request.POST.get('content'),
        )
        return redirect('home')

    context = {'form': form, 'topics': topics}
    return render(request, 'pages/list_form.html', context)


@login_required(login_url='login')
def updateList(request, pk):
    list = List.objects.get(id=pk)
    form = ListForm(instance=list)
    topics = Topic.objects.all()
    if request.user != list.host:
        return HttpResponse('Your are not allowed here!!')

    if request.method == 'POST':
        topic_name = request.POST.get('topic')
        topic, created = Topic.objects.get_or_create(name=topic_name)
        list.name = request.POST.get('name')
        list.topic = topic
        list.content = request.POST.get('content')
        list.save()
        return redirect('home')

    context = {'form': form, 'topics': topics, 'list': list}
    return render(request, 'pages/list_form.html', context)


@login_required(login_url='login')
def deleteList(request, pk):
    list = List.objects.get(id=pk)

    if request.user != list.host:
        return HttpResponse('Your are not allowed here!!')

    if request.method == 'POST':
        list.delete()
        return redirect('home')
    return render(request, 'pages/delete.html', {'obj': list})


@login_required(login_url='login')
def deleteMessage(request, pk):
    message = Message.objects.get(id=pk)

    if request.user != message.user:
        return HttpResponse('Your are not allowed here!!')

    if request.method == 'POST':
        message.delete()
        return redirect('home')
    return render(request, 'pages/delete.html', {'obj': message})


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
    topics = Topic.objects.filter(name__icontains=q)
    return render(request, 'pages/topics.html', {'topics': topics})


def whoToFollowPage(request):
    # TODO
    # Single page to show list of top creators
    # Can be opened using the short list on the main list homepage (on the right hand side)
    pass
