# Authenticated POST to /v1/fragments with charset in Content-Type
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`This has charset`

HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 16

[Captures]
url: header "Location"

# GET the same fragment and confirm we get text/plain back
GET {{url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
Content-Length: 16
[Asserts]
body == "This has charset"
