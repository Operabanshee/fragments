# Lab 9 S3 integration flow: create, read, delete, verify missing

# 1) Create a text fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`Hello S3!`

# 2) Expect 201 and capture Location as `url`
HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 9
[Captures]
url: header "Location"

# 3) Read the newly created fragment
GET {{url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

# 4) Expect 200, text/plain content type, and exact body
HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
[Asserts]
body == "Hello S3!"

# 5) Delete the same fragment
DELETE {{url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

# 6) Expect successful delete
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"

# 7) Try to read the fragment again
GET {{url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

# 8) Confirm it's gone
HTTP/1.1 404
[Asserts]
jsonpath "$.status" == "error"
