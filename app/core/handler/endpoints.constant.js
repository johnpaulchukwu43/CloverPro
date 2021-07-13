var app = {

  endpoints: {
    API_HOST: 'http://localhost:7779',
    API_URL: 'http://localhost:7779/api/v1',
    SERVICE_PROVIDER_ENDPOINTS:
      {
        login: '/serviceProvider/login',
        uploadFashion: '/serviceProvider/products/fashion',
        getOrders: function (providerName) {
          return '/serviceProvider/order/' + providerName
        },
        editOrder: function (orderId) {
          return '/admin/single-order/' + orderId

        },
        getProductsInCategoryByProvider: function (providerName, productCategoryPath) {
          return '/serviceProvider' + productCategoryPath + '?provider=' + providerName;
        },

        uploadRaw: '/serviceProvider/products/rawmaterial',
        uploadManufacturing: '/serviceProvider/products/manufacturing',
        uploadBeauty: '/serviceProvider/products/beauty',
        uploadElectronics: '/serviceProvider/products/electronics',
        deleteFashion: '/serviceProvider/products/fashion',
        deleteBeauty: '/serviceProvider/products/beauty',
        deleteComputer: '/serviceProvider/products/computer',
        deleteElectronics: '/serviceProvider/products/electronics',
        deleteManufacturing: '/serviceProvider/products/manufacturing',
        deletePhone: '/serviceProvider/products/phone',
        deleteRawMaterials: '/serviceProvider/products/rawmaterial',

      },
    CUSTOMER_ENDPOINTS: {
      //productCategoryPath
      getFashion: '/products/fashion',
      getBeauty: '/products/beauty',
      getComputer: '/products/computer',
      getElectronics: '/products/electronics',
      getManufacturing: '/products/manufacturing',
      getPhones: '/products/phone',
      getRaw: '/products/rawmaterial',
    },
    SUPER_ADMIN_ENDPOINTS: {
      login: '/admin/login',
      viewProviders: '/admin/providers/',
      getAllOrders: '/admin/orders/',
      editProviders: function (id) {
        return '/admin/providers/' + id;
      },
      editOrder: function (orderCode) {
        return '/admin/order/' + orderCode;
      },

    },

    AUTH_ENDPOINTS: {
      login: '/user/login',
      signUp: '/user/signup'
    },

    FACILITY_MANAGER_ENDPOINTS:{
      onboard:'/manager/onboard',
      tasks:'/tasks',
      updateTaskStatus:'/tasks/update-status',
      assignTaskToArtisan:'/tasks/assign-artisan',
      buildings:'/buildings',
      floors:'/floors',
      rooms:'/rooms',
      assets:'/assets',
      users:'/users'
    },

    OCCUPANT_ENDPOINTS: {
      complaints: '/occupant/complaints',
      updateComplaintStatus: '/occupant/complaints/update-status'
    },
    ARTISAN_ENDPOINTS:{
      tasks:'/artisan/tasks',
      updateTaskStatus:'/artisan/task/update-status',
    },
    ANALYTICS:{
      userTypeCount: '/analytics/user/count',
      assetsCount: '/analytics/assets/count',
      tasksCount: '/analytics/tasks/count'
    }
  },

  details: {
    APP_NAME: 'Project',
    FASHION: 'fashions',
    RAW_MATERIAL: 'rawMaterials',
    MANUFACTURING: 'manufacturing',
    BEAUTY: 'beauties',
    CLOUDINARY_URL: 'https://api.cloudinary.com/v1_1/jworks/image/upload',
    CLOUDINARY_UPLOAD_PRESET: 'test-preset',
    fashionCollection: 'fashions',
    rawMaterialCollection: 'rawMaterials',
    phoneCollection: 'phones',
    electronicCollections: 'electronics',
    manufacturingCollection: 'manufacturing',
    beautyCollection: 'beauties',
    computerCollection: 'computers',
    cartTypes: ['customer', 'guest'],
    USER_TYPES: {
      SYSTEM: "System",
      FACILITY_MANAGER: "facilityManager",
      ARTISAN: "Artisan",
      OCCUPANT: "Occupant"
    },
    USER_STATUS: {
      PENDING: "PENDING",
      ACTIVE: "ACTIVE",
      INACTIVE: "INACTIVE",
    },
    MAINTENABLES_TYPE : ["Floor","Room", "Building", "Asset"],

    TASK_REQUESTED_BY: {
      MANAGER: "REQUESTED_BY_MANAGER",
      CLIENT: "REQUESTED_BY_CLIENT",
      SYSTEM: "SYSTEM",
    },
    TASK_STATUS :{
      LOGGED_SUCCESS: "logged successfully",
      RECEIVED_BY_MANAGER: "Received by Manager",
      ASSIGNED_TO_ARTISAN: "Assigned to Artisan",
      RECEIVED_BY_ARTISAN: "Received by Artisan",
      TASK_IN_PROGRESS: "work in progress",
      TASK_COMPLETE_PENDING_REVIEW: "work complete, pending review",
      COMPLETED: "work complete",
      CLOSED: "closed"
    },
    MAINTAINABLE_STATUS : {
      ACTIVE: "ACTIVE",
      INACTIVE: "INACTIVE"
    },
     ASSET_CATEGORY: [
       {name:"Electronics", value:"ELECTRONICS"},
       {name:"Furniture", value:"FURNITURE"},
       {name:"Miscellaneous", value:"MISCELLANEOUS"}
    ]

  },
  roles: {
    FACILITY_MANAGER: "facility-manager",
    ARTISAN: "artisan",
    OCCUPANT: "occupant"
  },

  authorities: {}


};



