{
  "rules": {
    "users": {
      ".read": false,
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".indexOn": ["coreAccountId", "accountType", "email"],

        "profile": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')",
          ".write": "auth.uid === $uid",
          "subscription": {
            ".read": "auth.uid === $uid || root.child('users/' + auth.uid + '/coreAccountId').val() === $uid",
            ".write": "auth.uid === $uid",
            ".validate": "newData.exists() ? newData.hasChildren(['status', 'planId']) : true"
          }
        },
        
        "workVendors": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".indexOn": "name"
        },

        "workPayments": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".indexOn": ["vendorId", "date"]
        },

        "clients": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".indexOn": "clientName"
        },
        
        "subscription": {
          ".read": "auth.uid === $uid || root.child('users/' + auth.uid + '/coreAccountId').val() === $uid",
          ".write": "auth.uid === $uid || root.child('users/' + auth.uid + '/role').val() === 'admin' || root.child('users/' + auth.uid + '/coreAccountId').val() === $uid",
          ".validate": "newData.exists() ? newData.hasChildren(['status', 'planId']) : true"
        },
        
        "expenses": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".indexOn": "date"
        },
        
        "reminders": { 
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".indexOn": "dueDate"
        },
        
        "vehicles": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')",
          ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".indexOn": ["vehicleNumber"],
          "$vehicleId": {
            // Allow writing if the user is the owner or part of the core account.
            ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
            // **FIX**: This validation should only apply when creating a NEW vehicle.
            ".validate": "newData.hasChild('vehicleNumber') && (!data.exists() || (data.exists() && newData.child('vehicleNumber').val() === data.child('vehicleNumber').val()))",
            "vehicleNumber": {
              // Once a vehicleNumber is set, it cannot be changed or removed.
              ".validate": "newData.isString() && (data.exists() ? newData.val() === data.val() : newData.val().length > 0)"
            },
            "currentFuel": {
              // **FIX**: Allow branch users to write to this specific field.
              ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
              ".validate": "newData.isNumber()"
            },
            "fuelLogs": {
              ".read": "auth != null && (auth.uid === $uid || root.child('users/' + auth.uid + '/coreAccountId').val() === $uid)",
              // **FIX**: Add a .write rule on the parent to allow `push` operations.
              ".write": "auth != null && (auth.uid === $uid || root.child('users/' + auth.uid + '/coreAccountId').val() === $uid)",
              "$logId": {
                ".indexOn": "truckNumber",
                // This rule now validates the data being pushed.
                ".validate": "newData.hasChildren(['timestamp', 'source', 'userId', 'coreAccountId']) && newData.child('userId').val() === auth.uid && newData.child('coreAccountId').val() === $uid"
              }
            }
          }
        },
        
        "tyre_history": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)"
        },
        
        "branches": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".write": "auth != null && auth.uid === $uid",
          "$branchId": {
            ".validate": "newData.exists() ? newData.hasChildren(['name', 'email', 'type', 'status', 'createdAt', 'createdBy']) : true"
          }
        },
        
        "branchAccounts": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid",
          "$branchId": {
            ".validate": "newData.exists() ? newData.hasChildren(['email', 'createdAt']) : true"
          }
        },
        
        "fuelPayments": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".indexOn": ["date", "pumpName"]
        },
        
        "petrolPumps": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          "$pumpId": {
            ".validate": "newData.exists() ? newData.hasChildren(['name', 'place', 'createdAt']) : true",
            "name": { ".validate": "newData.isString() && newData.val().length > 0" },
            "place": { ".validate": "newData.isString() && newData.val().length > 0" }
          }
        },
        
        "driverSalaryPayments": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".indexOn": ["vehicleNumber", "date"],
          "$paymentId": { 
            ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
            ".validate": "newData.exists() ? newData.hasChildren(['vehicleNumber', 'driverName', 'amount', 'date', 'timestamp']) : true"
          }
        },
        
        "vehicleWork": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".indexOn": ["vehicleNumber", "date", "status"],
          "$workId": {
            ".validate": "newData.exists() ? newData.hasChildren(['vehicleNumber', 'amount', 'date', 'status']) : true"
          }
        },

        "transporterPayments": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".indexOn": "transporterId"
        },

        "fuelLogs": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".indexOn": "truckNumber"
        },

        "lrReports": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          // **FIX**: Added indexes for common query fields to improve performance.
          ".indexOn": ["truckNumber", "lrType", "clientId", "date", "status", "vehicleWorkVendorId", "transporterId"]
        },

        "invoices": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".indexOn": ["clientId", "invoiceType"]
        },

        "payments": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".indexOn": ["clientId", "date"]
        },

        "tyreVehicles": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".indexOn": ["vehicleNumber", "createdAt"],
          "$vehicleId": {
            ".validate": "newData.exists() ? (newData.hasChild('vehicleNumber') && newData.hasChild('vehicleModel') && newData.hasChild('tyres')) : true",
            "vehicleNumber": { ".validate": "newData.isString() && newData.val().length > 0" },
            "vehicleModel": { ".validate": "newData.isString() && newData.val().length > 0" }
          }
        },

        "routes": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          ".indexOn": ["from", "to"],
          "$routeId": {
            // **FIXED**: Removed requirement for 'updatedAt' and changed 'distance > 0' to 'distance >= 0' for successful creation.
            ".validate": "newData.hasChildren(['from', 'to', 'distance']) && newData.child('distance').isNumber() && newData.child('distance').val() >= 0"
          }
        },

        "pumpTransactions": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          // **FIX**: Add a .write rule on the parent to allow `push` operations.
          ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('coreAccountId').val() === $uid)",
          "$transId": {
            // This rule now validates the data being pushed.
            ".validate": "newData.hasChildren(['timestamp', 'pumpName', 'userId', 'coreAccountId']) && newData.child('userId').val() === auth.uid && newData.child('coreAccountId').val() === $uid"
          },
          ".indexOn": ["pumpName", "date"]
        }
      }
    },

    "payments": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["userId", "clientId", "date", "companyName"],
      "$paymentId": {
        ".read": "auth != null && (data.child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('coreAccountId').val() === data.child('userId').val() || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".write": "auth != null && ((!data.exists() && newData.child('userId').val() === auth.uid) || (data.exists() && data.child('userId').val() === auth.uid) || root.child('users').child(auth.uid).child('coreAccountId').val() === data.child('userId').val() || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".validate": "newData.exists() ? (newData.hasChildren(['userId', 'amount', 'date', 'companyName', 'createdAt']) && newData.child('userId').val() === auth.uid) : true"
      }
    },

    "subscriptionPayments": {
      ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || data.child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('coreAccountId').val() === data.child('userId').val())",
      ".indexOn": "status",
      "$paymentId": {
        ".read": "auth != null && (data.child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('coreAccountId').val() === data.child('userId').val() || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".write": "auth != null && ((!data.exists() && (newData.child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('coreAccountId').val() === newData.child('userId').val())) || (data.exists() && root.child('users').child(auth.uid).child('role').val() === 'admin'))",
        ".validate": "newData.exists() ? newData.hasChildren(['userId', 'amount', 'status', 'createdAt']) : true"
      }
    },

    "branchCreationPayments": {
      ".read": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'admin' || data.child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('coreAccountId').val() === data.child('userId').val())",
      ".indexOn": "status",
      "$paymentId": {
        ".read": "auth != null && (data.child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('coreAccountId').val() === data.child('userId').val() || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".write": "auth != null && ((!data.exists() && (newData.child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('coreAccountId').val() === newData.child('userId').val())) || (data.exists() && root.child('users').child(auth.uid).child('role').val() === 'admin'))",
        ".validate": "newData.exists() ? newData.hasChildren(['userId', 'amount', 'status', 'createdAt']) : true"
      }
    },

    "coreSubscriptions": {
      "$coreUserId": {
        ".read": "auth != null && (auth.uid === $coreUserId || root.child('users').child(auth.uid).child('coreAccountId').val() === $coreUserId)",
        ".write": "auth != null && auth.uid === $coreUserId",
        ".validate": "newData.exists() ? newData.hasChildren(['status', 'endDate']) : true"
      }
    },

    "contactMessages": {
      ".write": true,
      ".read": "root.child('users').child(auth.uid).child('role').val() === 'admin'",
      "$messageId": {
        ".validate": "newData.exists() ? newData.hasChildren(['name', 'email', 'subject', 'message', 'timestamp', 'status']) && newData.child('status').val() === 'unread' : true"
      }
    },

    "vehicleRegistry": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'",
      "$userId": {
        ".read": "auth != null && (auth.uid === $userId || root.child('users').child(auth.uid).child('coreAccountId').val() === $userId)",
        ".write": "auth != null && (auth.uid === $userId || root.child('users').child(auth.uid).child('coreAccountId').val() === $userId)",
        "vehicles": {
          ".indexOn": ["vehicleNumber"],
          "$vehicleNumber": {
            ".validate": "newData.exists() ? newData.hasChildren(['registeredAt', 'registeredBy']) : true"
          }
        }
      }
    },

    // **REMOVED**: Fuel update and addition requests since we're using direct updates now
    // "fuelUpdateRequests": { ... },
    // "fuelAdditionRequests": { ... },

    ".read": false,
    ".write": false
  }
}