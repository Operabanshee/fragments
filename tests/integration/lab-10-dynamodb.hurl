# Lab 10 DynamoDB integration flow
# Create JSON and Markdown fragments, verify metadata, list, delete, and verify list state.

# 1) Create JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`{ "service": "DynamoDB" }`

# 2) Expect 201 and capture Location + id
HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 25
jsonpath "$.fragment.id" matches "^[0-9a-fA-F-]{36}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# 3) Get first fragment metadata (/info)
GET {{fragment1_url}}/info
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment1_id}}"
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 25
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString

# 4) Create Markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`DynamoDB is **great**.`

# 5) Expect 201 and capture Location + id
HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 22
jsonpath "$.fragment.id" matches "^[0-9a-fA-F-]{36}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# 6) Get second fragment metadata (/info)
GET {{fragment2_url}}/info
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment2_id}}"
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 22
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString

# 7) List fragments (ids only), include both ids
GET http://localhost:8080/v1/fragments
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
body contains "{{fragment1_id}}"
body contains "{{fragment2_id}}"

# 8) Delete the first fragment
DELETE {{fragment1_url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

# 9) Confirm delete succeeds
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"

# 10) Try to GET the first fragment again
GET {{fragment1_url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

# 11) Confirm deleted fragment now returns 404
HTTP/1.1 404
[Asserts]
jsonpath "$.status" == "error"

# 12) List again, confirm first id missing and second still present
GET http://localhost:8080/v1/fragments
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
body not contains "{{fragment1_id}}"
body contains "{{fragment2_id}}"
