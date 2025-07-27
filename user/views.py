from django.shortcuts import render

def home_view(request):
    print('view called')
    return render(request,'index.html')
