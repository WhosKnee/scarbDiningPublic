# Scarborough Dining REST API Documentation

## API
### Create

- description: Create a new restaurant
- request: `POST /api/restaurants/`
    - content-type: `application/json`
    - body: object
      - name: (string) the restaurant name
      - phoneNumber: (string) the phone number for the restaurant
      - password: (string) plaintext password
      - address: (string) the address of the restaurant
      - ownerFirstName: (string) the first name of the owner
      - ownerLastName: (string) the last name of the owner
      - ownerTitle: (string) the title of the owner
      - ownerEmail: (string) the email of the owner
      - ownerPhoneNumber: (string) owner's personal phone
- response: 200
    - content-type: `application/json`
    - body: object
      - name: (string) the restaurant name
      - phoneNumber: (string) the phone number for the restaurant
      - password: (string) plaintext password
      - address: (string) the address of the restaurant
      - ownerFirstName: (string) the first name of the owner
      - ownerLastName: (string) the last name of the owner
      - ownerTitle: (string) the title of the owner
      - ownerEmail: (string) the email of the owner
      - ownerPhoneNumber: (string) owner's personal phone

``` 
    $ curl -X POST 
       -H "Content-Type: `application/json`" 
       -d {"name": "test restaurant", "phoneNumber": "416 571 2723", "password": 12345, "address": "123 Nowhere Road", "ownerFirstName": "John", "ownerLastName": "Smith", "ownerTitle": "Mr.", "ownerEmail": "johnsmith@gmail.com", "ownerPhoneNumber": "647 571 4269"}
       http://localhost:3000/api/restaurants/'
```

## Read

## Update

- description: Add a story to a restaurant
- request: `PATCH /api/restaurants/stories/`
    - content-type: `application/json`
    - body: object
      - id: (string) the restaurant id
      - storyText: (string) the text for the story
      - mediaLink: (string) the media link for the story
- response: 200
    - content-type: `application/json`
    - body: object
      - id: (string) the restaurant id
      - storyText: (string) the text for the story
      - mediaLink: (string) the media link for the story

``` 
    $ curl -X POST 
       -H "Content-Type: `application/json`" 
       -d {"_id": "5efa626149cfedd33f0b3cb4", "storyText": "this is a test", "mediaLink": "this is a test link"}
       http://localhost:3000/api/restaurants/stories/'
```