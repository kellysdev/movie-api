module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": ["eslint:recommended", "plugin:n/recommended"],
    "overrides": [
        {
            "env": {
                "node": true,
                "amd": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": 2021,
        "sourceType": "module"
    },
    "rules": {
        "n/exports-style": ["error", "module.exports"]
    }
}
