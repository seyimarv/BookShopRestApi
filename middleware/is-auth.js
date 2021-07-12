const jwt = require('jsonwebtoken')  //to validate incoming tokens

module.exports = (req,res , next) => {
    const authHeader = req.get('Authorization')
    if (!authHeader) {
        const error = new Error('Not authentucated');
        error.statusCode = 401;
        throw error;
    }
    const token = authHeader.split(' ')[1] //getting the token from the authorization header set in the frontend
    // console.log(token)
    let decodedToken
    try {
        decodedToken = jwt.verify(token, 'somesupersecret') //the arguement should be the secret used for signing / creating the token
    }  catch {
        err.statusCode = 500
        throw err;
    }
    if (!decodedToken) {
        const err = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    } //if token isnt validated
    req.userId = decodedToken.userId; //extracting the userId from the token
    next();

}