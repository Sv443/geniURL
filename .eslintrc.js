module.exports = {
    "env": {
        "commonjs": true,
        "es2021": true,
        "node": true,
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": "latest",
    },
    "rules": {
        "quotes": [ "error" , "double" ],
        "semi": [ "error" , "always" ],
        "comma-dangle": [ "error" , "always-multiline" ],
        "array-bracket-newline": [ "error", "consistent" ],
        "function-paren-newline": [ "error", "multiline" ],
    },
};
