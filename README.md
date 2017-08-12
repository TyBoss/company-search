# Example of an application built using plain old JS and CSS, served up on a node platter. Originally used a submission for a challenge.
* Displays list of companies in a paged fashion currently 10 companies per page.
* Able to view more details via expand/collapse functionality.
* Includes search and filtering of companies depending on name and company type.
* Application accounts for some levels of responsiveness, having a different view based on a couple dimensions, (I.E. IPhone 6).

## Getting started

You can install dependencies and start up the server with a quick `npm install && npm start`. Once it is running you can hit the `public/index.html` page at [http://localhost:3000](http://localhost:3000).

The companies API lives at [http://localhost:3000/api/companies](http://localhost:3000/api/companies). It takes in the following parameters:

| Query param | Effect |
| ----------- | ------ |
| q           | Limits the results to companies with names that match `q` |
| start       | Returns result starting at the `start`th result |
| limit       | Restricts the result set to include no more than `limit` results |
| laborTypes  | A comma delimited list of labor types to filter by (all must match) |

And returns results similar to this:

```js
{
  "total": 500,
  "results": [
    {
      "avatarUrl": "https:\/\/bc-prod.imgix.net\/avatars\/5430e7a55cdc2e0300dd72ef.png?auto=format&fit=fill&bg=fff",
      "laborType": [
        "Union"
      ],
      "name": "BASS Electric",
      "phone": "(261) 917-1637",
      "website": "http:\/\/bufodu.ps\/pakzer"
    },
    {
      "avatarUrl": "https:\/\/bc-prod.imgix.net\/avatars\/5430e7a55cdc2e0300dd7310.jpeg?auto=format&fit=fill&bg=fff",
      "laborType": [
        "Non-Union",
        "Union"
      ],
      "name": "Rex Moore Group, Inc.",
      "phone": "(949) 700-2752",
      "website": "http:\/\/wa.ch\/wisli"
    }
  ]
}
```
