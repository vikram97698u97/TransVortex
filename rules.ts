{
  "rules": {
    "users": {
      ".read": false,
      "$uid": {
        // Core read/write access: Only the owner or an overall 'admin' can access the top-level profile.
        ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".indexOn": ["accountType", "email"],

        "profile": {
          ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')",
          ".write": "auth.uid === $uid"
        },
        
        "workVendors": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid",
          ".indexOn": "name"
        },

        "workPayments": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid",
          ".indexOn": ["vendorId", "date"]
        },

        "clients": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid",
          ".indexOn": "clientName"
        },
        
        "subscription": {
          ".read": "auth.uid === $uid",
          // Allow owner to write (e.g., update trial details from plan-selection)
          ".write": "auth.uid === $uid || root.child('users/' + auth.uid + '/role').val() === 'admin'", 
          ".validate": "newData.exists() ? newData.hasChildren(['status', 'planId']) : true"
        },
        
        "expenses": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid",
          ".indexOn": "date"
        },
        
        "reminders": { 
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid",
          ".indexOn": "dueDate"
        },
        
        "vehicles": {
          ".read": "auth != null && auth.uid === $uid", // Simplified read to only owner
          ".write": "auth != null && auth.uid === $uid", // Only owner can modify vehicles list
          ".indexOn": ["vehicleNumber"],
          "$vehicleId": {
            ".write": "auth != null && auth.uid === $uid",
            ".validate": "newData.hasChild('vehicleNumber') && (!data.exists() || (data.exists() && newData.child('vehicleNumber').val() === data.child('vehicleNumber').val()))",
            "vehicleNumber": {
              ".validate": "newData.isString() && (data.exists() ? newData.val() === data.val() : newData.val().length > 0)"
            },
            "currentFuel": {
              ".write": "auth != null && auth.uid === $uid",
              ".validate": "newData.isNumber()"
            },
            "fuelLogs": {
              ".read": "auth != null && auth.uid === $uid",
              // FIX: Added .write rule on the parent to allow `push` operations.
              ".write": "auth != null && auth.uid === $uid", 
              "$logId": {
                ".indexOn": "truckNumber",
                ".validate": "newData.hasChildren(['timestamp', 'source', 'userId']) && newData.child('userId').val() === auth.uid"
              }
            }
          }
        },
        
        "tyre_history": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid"
        },
        
        "branches": { // Retained but simplified, only owner can manage.
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid",
          "$branchId": {
            ".validate": "newData.exists() ? newData.hasChildren(['name', 'email', 'type', 'status', 'createdAt', 'createdBy']) : true"
          }
        },
        
        "branchAccounts": { // Retained but simplified, only owner can manage.
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid",
          "$branchId": {
            ".validate": "newData.exists() ? newData.hasChildren(['email', 'createdAt']) : true"
          }
        },
        
        "fuelPayments": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid",
          ".indexOn": ["date", "pumpName"]
        },
        
        "petrolPumps": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid",
          "$pumpId": {
            ".validate": "newData.exists() ? newData.hasChildren(['name', 'place', 'createdAt']) : true",
            "name": { ".validate": "newData.isString() && newData.val().length > 0" },
            "place": { ".validate": "newData.isString() && newData.val().length > 0" }
          }
        },
        
        "driverSalaryPayments": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid",
          ".indexOn": ["vehicleNumber", "date"],
          "$paymentId": { 
            ".write": "auth != null && auth.uid === $uid",
            ".validate": "newData.exists() ? newData.hasChildren(['vehicleNumber', 'driverName', 'amount', 'date', 'timestamp']) : true"
          }
        },
        
        "vehicleWork": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid",
          ".indexOn": ["vehicleNumber", "date", "status"],
          "$workId": {
            ".validate": "newData.exists() ? newData.hasChildren(['vehicleNumber', 'amount', 'date', 'status']) : true"
          }
        },

        "transporterPayments": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid",
          ".indexOn": "transporterId"
        },

        "fuelLogs": {
          ".read": "auth != null && auth.uid === $uid",
          // FIX: Added .write rule on the parent to allow `push` operations.
          ".write": "auth != null && auth.uid === $uid", 
          ".indexOn": "truckNumber",
          "$logId": {
            // Re-added .validate rule here for clarity on push.
            ".validate": "newData.hasChildren(['timestamp', 'source', 'userId']) && newData.child('userId').val() === auth.uid"
          }
        },

        "lrReports": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid",
          ".indexOn": ["truckNumber", "lrType", "clientId", "date", "status", "vehicleWorkVendorId", "transporterId"]
        },

        "invoices": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid",
          ".indexOn": ["clientId", "invoiceType"]
        },

        "payments": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid",
          ".indexOn": ["clientId", "date"]
        },

        "tyreVehicles": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid",
          ".indexOn": ["vehicleNumber", "createdAt"],
          "$vehicleId": {
            ".validate": "newData.exists() ? (newData.hasChild('vehicleNumber') && newData.hasChild('vehicleModel') && newData.hasChild('tyres')) : true",
            "vehicleNumber": { ".validate": "newData.isString() && newData.val().length > 0" },
            "vehicleModel": { ".validate": "newData.isString() && newData.val().length > 0" }
          }
        },

        "routes": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid",
          ".indexOn": ["from", "to"],
          "$routeId": {
            ".validate": "newData.hasChildren(['from', 'to', 'distance']) && newData.child('distance').isNumber() && newData.child('distance').val() >= 0"
          }
        },

        "pumpTransactions": {
          ".read": "auth != null && auth.uid === $uid",
          // FIX: Add a .write rule on the parent to allow `push` operations.
          ".write": "auth != null && auth.uid === $uid",
          "$transId": {
            ".validate": "newData.hasChildren(['timestamp', 'pumpName', 'userId']) && newData.child('userId').val() === auth.uid"
          },
          ".indexOn": ["pumpName", "date"]
        }
      }
    },

    "payments": {
      // General payments node remains largely the same for core/admin logic
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["userId", "clientId", "date", "companyName"],
      "$paymentId": {
        ".read": "auth != null && (data.child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".write": "auth != null && ((!data.exists() && newData.child('userId').val() === auth.uid) || (data.exists() && data.child('userId').val() === auth.uid) || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".validate": "newData.exists() ? (newData.hasChildren(['userId', 'amount', 'date', 'companyName', 'createdAt']) && newData.child('userId').val() === auth.uid) : true"
      }
    },

    // Subscription & Branch Payment nodes are kept as they manage financial transactions outside the user's primary data.
    "subscriptionPayments": {
      ".read": "auth != null", 
      ".indexOn": "status",
      "$paymentId": {
        ".read": "auth != null && (data.child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".write": "auth != null && ((!data.exists() && newData.child('userId').val() === auth.uid) || (data.exists() && root.child('users').child(auth.uid).child('role').val() === 'admin'))",
        ".validate": "newData.exists() ? newData.hasChildren(['userId', 'amount', 'status', 'createdAt']) : true"
      }
    },

    "branchCreationPayments": {
      ".read": "auth != null", 
      ".indexOn": "status",
      "$paymentId": {
        ".read": "auth != null && (data.child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".write": "auth != null && ((!data.exists() && newData.child('userId').val() === auth.uid) || (data.exists() && root.child('users').child(auth.uid).child('role').val() === 'admin'))",
        ".validate": "newData.exists() ? newData.hasChildren(['userId', 'amount', 'status', 'createdAt']) : true"
      }
    },

    "userRegistrationRequests": {
      ".read": "root.child('users').child(auth.uid).child('role').val() === 'admin'",
      "$requestId": {
        ".write": "(!data.exists() && newData.child('userId').val() === auth.uid) || (root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".validate": "newData.hasChildren(['userId', 'email', 'name', 'timestamp', 'status'])",
        "status": {
          ".validate": "newData.isString() && ((!data.exists() && newData.val() === 'pending') || (data.exists() && root.child('users').child(auth.uid).child('role').val() === 'admin'))"
        }
      }
    },

    "coreSubscriptions": {
      "$coreUserId": {
        ".read": "auth != null && auth.uid === $coreUserId",
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
        ".read": "auth != null && auth.uid === $userId",
        ".write": "auth != null && auth.uid === $userId",
        "vehicles": {
          ".indexOn": ["vehicleNumber"],
          "$vehicleNumber": {
            ".validate": "newData.exists() ? newData.hasChildren(['registeredAt', 'registeredBy']) : true"
          }
        }
      }
    },

    "demoRequests": {
      ".read": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'",
      ".write": "auth == null", 
      "$requestId": {
        ".validate": "newData.hasChildren(['name', 'email', 'phone', 'status', 'timestamp']) && newData.child('status').val() === 'pending'",
        "status": {
          ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
        }
      }
    },

    ".read": false,
    ".write": false
  }
}