import math 

print(math.pi)
print(math.e)


print(math.pow(2,3))

print(2**3)

print(math.sqrt(49))

print(math.cbrt(8))

x=9.234234

print(math.floor(x))

print(math.ceil(x))


print(abs(-9))


import sys

INT_MAX=sys.maxsize
INT_MIN=-sys.maxsize-1


print(INT_MAX)


print("=====LISTEN=====")

arr = [3, 1, 9, 2]

mx = float('-inf')
mn = float('inf')
print(mx)
for x in arr:
    mx = max(mx, x)
    mn = min(mn, x)

print(mx, mn)
