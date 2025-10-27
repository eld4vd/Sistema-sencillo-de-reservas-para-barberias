module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  // Si usas tsconfig-paths, puedes agregar:
  // "modulePaths": ["<rootDir>/src"],
};