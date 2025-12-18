arr=[10,11,12]

print(arr[-1])

arr1=arr[0:2]

print(arr1)

arr2=arr[1:]

print(arr2)


#APPEND

arr.append(13)
print(arr)

#INSERT

arr.insert(1,111)

print(arr)

arr.extend([4, 5])


arr.remove(111)

print(arr)

x = arr.pop()     # removes last
y = arr.pop(0)    # removes index 0


#REMOVING AT INDEX

arr[1:1]=[]
print(arr)

#REMOVING FROM INDEX 1 TO 2
arr[1:3]=[]
print(arr)


arr=[1,2,34,5,6,6,7,88]

print(arr)

arr[1:1]=[100,200,300]
print(arr)

arr[1:4]=[100,222,333,555]
print(arr)

evens = [x for x in range(10) if x % 2 == 0]

print(evens)