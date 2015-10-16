#!/bin/bash

# Set up users
curl -XPOST -d "{ \"name\" : \"Eysteinn\", \"token\" : \"testToken\", \"age\" : 23, \"gender\" : \"m\" }" -H "Content-Type: Application/json" http://localhost:3000/api/users
echo
curl -XPOST -d "{ \"name\" : \"Arnar\", \"token\" : \"testToken2\", \"age\" : 22, \"gender\" : \"m\" }" -H "Content-Type: Application/json" http://localhost:3000/api/users
echo
echo "http://localhost:3000/api/users"
curl -XGET http://localhost:3000/api/users
# Set up companies
echo
curl -XPOST -d "{ \"name\" : \"Glo\", \"description\" : \"glo er gott\", \"punchcard_liftime\" : 10 }" -H "Content-Type: Application/json" -H "ADMIN_TOKEN: rssiprmp" http://localhost:3000/api/companies
echo
curl -XPOST -d "{ \"name\" : \"Serrano\", \"description\" : \"fresh happy mex\", \"punchcard_liftime\" : 10 }" -H "Content-Type: Application/json" -H "ADMIN_TOKEN: rssiprmp" http://localhost:3000/api/companies
echo
echo "http://localhost:3000/api/companies"
curl -XGET http://localhost:3000/api/companies

# echo
# echo "http://localhost:3000/api/companies/0"
# curl -XGET http://localhost:3000/api/companies/0
#
# echo
# echo "http://localhost:3000/api/companies/3"
# curl -XGET http://localhost:3000/api/companies/3
#
# # Adding punches
# echo
# curl -XPOST -H "Content-Type: Application/json" -H "TOKEN: testToken" http://localhost:3000/api/punchcard/
# echo
# curl -XPOST -d "{ \"companyId\" : 1 }" -H "Content-Type: Application/json" http://localhost:3000/api/users/0/punches
# #
# # Get punches
# echo
# echo "http://localhost:3000/api/users/0/punches"
# curl -XGET http://localhost:3000/api/users/0/punches
# echo
# echo "http://localhost:3000/api/users/0/punches?company=0"
# curl -XGET http://localhost:3000/api/users/0/punches?company=0
# echo
# echo "http://localhost:3000/api/users/0/punches?company=4"
# curl -XGET http://localhost:3000/api/users/0/punches?company=4
# echo
# echo "http://localhost:3000/api/users/2/punches?company=0"
# curl -XGET http://localhost:3000/api/users/2/punches?company=4
# echo
# echo "http://localhost:3000/api/users/0/punches/0"
# curl -XGET http://localhost:3000/api/users/0/punches/0

# echo
# echo "CLEAN UP"
# echo "DELETE http://localhost:3000/api/companies"
# curl -XDELETE http://localhost:3000/api/companies
# echo "http://localhost:3000/api/companies"
# curl -XGET http://localhost:3000/api/companies
