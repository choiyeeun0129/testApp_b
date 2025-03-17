const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: "GNU MOT API",
    description: "GNU MOT API with express",
  },
  host: '',
  schemes: ["https" ,"http"],
  securityDefinitions: {
    BearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: '인증 토큰을 Bearer {token} 형식으로 입력하세요.',
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  definitions: {
    CodeGroup: {
      grpCode: 'LEVEL_TY',
      name: 'Level Type',
      memo: '',
      enabled: true
    },
    Code: {
      grpCode: 'LEVEL_TY',
      code: 'LEVEL_1',
      name: 'Level 1',
      memo: '',
      enabled: true,
      codeGroup: {
        $ref: '#/definitions/CodeGroup'
      },
    },
    User: {
      id: 1000,
      loginId: 'userId',
      name: 'User',
      email: 'user@email.com',
      website: '',
      profileImage: '',
      birthYear: '',
      mobileNumber: '',
      roleCode: '',
      batchCode: '',
      memo: '',
      companyName: '',
      officeAddress: '',
      officePhone: '',
      level: '',
      job: '',
      major: '',
      degreeCode: '',
      courseCode: '',
      advisor: '',
      graduated: true,
      isPublic: true,
      isPublicMobile: true,
      isPublicOffice: true,
      isPublicEmail: true,
      isPublicDepartment: true,
      isPublicBirth: true,
      enabled: true,
      lastLoginDt: '',
      createdAt: '',
      updatedAt: '',
      role: { $ref: '#/definitions/Code' },
      batch: { $ref: '#/definitions/Code' },
      degree: { $ref: '#/definitions/Code' },
      course: { $ref: '#/definitions/Code' }
    },
    Document: {
      id: 1,
      typeCode: '',
      title: '',
      content: '',
      createdAt: '',
      updatedAt: '',
      type: { $ref: '#/definitions/Code' }
    },
    File: {
      id: 1,
      fileName: 'file-xxxxxx.png',
      originalName: 'file.png',
      path: '/upload/images/file-xxxxxx.png',
      destination: '/upload/images/',
      size: '100000',
      mimeType: 'image/png',
      url: '',
      imageWidth: 100,
      imageHeight: 100
    },
    Pagination: {
      contents: [],
      pagination: {
          page: 1,
          totalCount: 1000
      }
    },
    ErrorMessage: {
      success: false,
      error: 'TokenExpiredError',
      message: 'jwt expired'
    },
  }
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["../apps/api.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);