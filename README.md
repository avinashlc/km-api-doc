# Krishimandir API

A guide to make use of krishimandir's pathom-json api

#### NOTE

If you are unfamiliar with pathom in general see [pathom's `docs`](https://blog.wsscode.com/pathom/v2/pathom/2.2.0/introduction.html) for more information on eql queries.

## Documentation

### General

- Query structure: `{:query [q1 q2 ...]}`
- All API will be processed by a single `POST` request endpoint: `"/pathom"`
- Resolvers: Used to retrieve value from the backend. kind of like `GET` request

  ```clojure
    - eg1: [:farmers]
    - eg2: [{:farmers {:farmer/id [:farmer/name]}}]
    - eg3: [{[:farmer/id "whateverid"] [:farmer/name :farmer/mobile]}]

    note: the final/nested `[]` will always be the keys that will be resolved and returned from the backend
  ```

- Mutations: Used to `mutate/[update/create]` data in/to the backend. kind of like `POST` request

  ```clojure
    - eg1: [(farmer/push {:farmer/name "whatever" :farmer/mobile "94262985"})]
    - eg2: [(farmer/send-money {:farmer/id "whateverid" :farmer/amount "500000000"})]
  ```

### Farmer

> Resolver

```clojure
    1. [:farmers]
          => all farmer ids
          => returns an array of objects with farmer.id on each object
          => [{"farmer.id": "1"}, {"farmer.id": "2"}]

    2. [{:farmers {:farmer/id [:farmer/id :farmer/name]}}]
          => all farmer data
          => returns an array of objects with farmer.id & farmer.name on each object
          => [{"farmer.id": "1", "farmer.name": "one"}, {"farmer.id": "2", "farmer.name": "two"}]

    3. [{[:farmer/id "1"] [:farmer/id :farmer/mobile]}]
          => a single farmer
          => returns an single farmer object for the given farmer/id
          => [{"farmer.id": "1", "farmer.mobile": "78484"}]

    4. [{[:farmer/location {:state "a" :district "b" :taluka "c" :village "d" :crop "e"}]
         [:filtered-farmers]}]
          => search farmer by location
          => returns an array of objects with farmer.id on each object
          => [{"farmer.id": "1"}, {"farmer.id": "2"}]

    5. All allowed keys for the farmer resolver
          [:farmer/id => string/uuid
         :farmer/name => string
         :farmer/nickname => string
         :farmer/mobile => string
         :farmer/lang => string/keyword
         :farmer/farms => array
         :farmer/state => string
         :farmer/district => string
         :farmer/sub-districts => string
         :farmer/taluka => string
         :farmer/village => string
         :farmer/favourite-crops => string]
```

> Mutation

```clojure
    1. [(farmer/push {:farmer/name "one", :farmer/mobile "111", `... all allowed keys`})]
        => create new farmer
        => updates an existing farmer if :farmer/id is passed within the data
        => returns created/updated :farmer/id on successful mutation

    2. Example:
        [(farmer/push {:farmer/name "one",
                       :farmer/mobile "111"
                       :farmer/lang "en"
                       :farmer/state "Gujarat"
                       :farmer/district "botad"
                       :farmer/taluka  "taluka"
                       :farmer/favourite-crops ["Apple"]
                       :farmer/farms [{:farm/name "one" :farm/acres 55}]
                       })]

```

> REST

```clojure
    1. "/import-multiple/farmer"
        => POST request
        => Request Body => {"data-file" : excel-file}
        => imports a list of farmers from the excel file to the database
        => NOTE: Not a part of pathom request
    2. "/export-multiple/farmer"
        => GET request
        => exports a base excel sheet with column names prefilled for the client to download and add farmers
        => NOTE: Not a part of pathom request
```

> In JavaScript Ecosystem

```javascript
const allFarmerIDs = "{:query [:farmers]}";
const allFarmerData = "{:query [{:farmers {:farmer/id [:farmer/name]}}]}";
const farmerById = '{:query [{[:farmer/id "1"] [:farmer/id :farmer/mobile]}]}';
```

### location

> Resolvers

```clojure
    1. [:states]
        => all state names
        => ["ASSAM", "KERALA"]

    2. [{[:state "Gujarat"] [:districts]}]
        => all district names by state

    3. [{([:state "Gujarat"] {:pathom/context {:district "botad"}}) [:talukas]}]
        => all talukas names for given district and state
        => NOTE: To pass multiple values as arguments to a query, it needs to be constructed using :pathom/context.
                 It will join whatever is passed to it's map and make it into a single map.
                 Here, the query can be reasoned about like,
                      take {:state "gujarat", :district "botad"} => return [:talukas] for it

    4. [{([:state "Gujarat"] {:pathom/context {:district "botad" :taluka "taluka"}}) [:villages]}]
        => all villages names for given taluka, district and state
        => NOTE: same logic applies as before

```

- Reference: [Multiple inputs `docs`](https://blog.wsscode.com/pathom/v2/pathom/2.2.0/connect/resolvers.html#_multiple_inputs)

### Dealer

> Resolver

```clojure
    1. [:retailers]
    2. [{:retailers {:retailer/id [:retailer/id :retailer/name]}}]
    3. [{[:retalerr/id "1"] [:retalerr/id :retalerr/mobile]}]
    4. All allowed keys for the retailer resolver
        [:retailer/id
         :retailer/firstname
         :retailer/mobile
         :retailer/company-name
         :retailer/state
         :retailer/district
         :retailer/taluka
         :retailer/village
         :retailer/stats
         :retailer/pincode
         :retailer/products
         :retailer/location
         :retailer/fetilizers-retail-license
         :retailer/fetilizers-wholesale-license
         :retailer/pesticides-license
         :retailer/seeds-license
         :retailer/credit-account
         :retailer/booked-credits
         :retailer/contacts => can be sub queried. checks [contacts] docs
         :retailer/address
         :retailer/gst-no]
```

> Mutation

```clojure
    1. [(retailer/push {:retailer/name "one", :retailer/mobile "111", `... all allowed keys`})]
        => create new retailer
        => updates an existing retailer if :retailer/id is passed within the data
        => returns created/updated :retailer/id on successful mutation

    2. Example:
        [(retailer/push {:retailer/name "one",
                         :retailer/mobile "111"
                         :retailer/lang "en"
                         :retailer/state "Gujarat"
                         :retailer/district "botad"
                         :retailer/taluka  "taluka"
                         :retailer/fetilizers-retail-license "#inst time"
                         :retailer/fetilizers-wholesale-license "#inst time"
                         :retailer/pesticides-license "#inst time"
                         :retailer/seeds-license "#inst time"
                         :retailer/contacts [{:contact/id "asaa"} {:contact/id "asasa"}]
                         :retailer/gst-no "amfcinw448"]
                       })]
```

NOTE: refer [contacts] docs for more info about retailer/contacts

> REST

```clojure
    1. "/import-multiple/retailer"
        => POST request
        => Request Body => {"data-file" : excel-file}
        => imports a list of retailers from the excel file to the database
        => NOTE: Not a part of pathom request
    2. "/export-multiple/retailer"
        => GET request
        => exports a base excel sheet with column names prefilled for the client to download and add retailers
        => NOTE: Not a part of pathom request
```

### contact

> Resolvers

```clojure
    1. [{:retailer/contacts {:contact/id [:contact/id :contact/name]}}]
    2. [{[:contact/id "1"] [:contact/id :contact/mobile]}]
    2. All allowed keys for the contact resolver
        [:contact/id
         :contact/firstname
         :contact/lastname
         :contact/name
         :contact/adrs.street-address
         :contact/adrs.lvl1
         :contact/adrs.lvl2
         :contact/adrs.lvl3
         :contact/adrs.lvl4
         :contact/adrs.lvl5
         :contact/adrs.country
         :contact/adrs.pincode
         :contact/emails
         :contact/phone-numbers]
```

> Mutation

```clojure
    1. [(contact/push {:contact/name "one", :contact/phone-numbers ["111" "8484"], `... all allowed keys`})]
        => create new contact
        => updates an existing contact if :contact/id is passed within the data
        => returns created/updated :contact/id on successful mutation

    2. [(contact/push-many {:contacts [{:contact/name "one" :contact/phone-numbers ["111" "8484"]}
                                       {:contact/name "one" :contact/phone-numbers ["111" "8484"]}]})]
        => Same as contact/push but multiple contacts can be pushed
```

### Auth

> REST

```clojure
    1. "/login"
        => POST request
        => Request Body =>  {"grant_type" : "password",
                             "scope" : "openid"
                             "username" : {{username}}
                             "password": {{password}}}
        => imports a list of farmers from the excel file to the database
    2. "/token-refresh"
        => POST request
        => params: {"grant_type" : "refresh_token",
                    "refresh_token" : {{RF_TOKEN}}}
```
