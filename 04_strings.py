s="python"
print(s[0:3])
print(s[3:6])

s=s[:3]+"X"+s[3:]

print(s)


#Replace char

index=4

s=s[:4]+"9"+s[5:]

print(s)

#Replace last character


s=s[:len(s)-1]+"7"

print(s)

#Replace first char

s='R'+s[1:len(s)]

print(s)