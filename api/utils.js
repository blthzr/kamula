var crypto = require('crypto');

exports.sha1 = function sha1( data ) {
    var salt = "#¤%/!asd";
    var generator = crypto.createHash('sha1');
    generator.update( data + salt );
    return generator.digest('hex');
}

function isNullOrBlankString(str) {
    if (!str|| !str.length || /^\s*$/.test(str))
        return true;
        
    return false;
}

exports.validAccount = function validAccountDetails(account) {
    if (account.user != undefined && isNullOrBlankString(account.user))
        return false;
        
    if (account.password != undefined && isNullOrBlankString(account.password))
        return false;
        
    if (account.name != undefined && isNullOrBlankString(account.name))
        return false;
        
    if (account.email != undefined && isNullOrBlankString(account.email))
        return false;

    console.log(account);
        
    var pattern_numbers = /[^0-9]/g;
    var result = account.user.match(pattern_numbers);
    
    if (result)
    {
        var temp = "";
        for(var i=0; i < result.length; i++)
        {
            temp += result[i];
        }
        var pattern_lowercase = /[^a-z]/g;
        result = temp.match(pattern_lowercase);
        
        if(result)
        {
            temp = "";
            for(var i=0; i < result.length; i++)
            {
                temp += result[i];
            }
            var pattern_uppercase = /[^A-Z]/g;
            result = temp.match(pattern_uppercase);
            
            if (result)
            {
                console.log("username has invalid characters");
                return false;
            }
        }
    }
    
    if (account.name.length > 30)
    {
        console.log("name too long");
        return false;
    }
        
    return true;
}

exports.validStatusMessage = function validStatusMessage(status)
{
    if (isNullOrBlankString(status.body) || status.body.length > 200)
        return false;
        
    return true;
}

exports.validStatusComment = function validStatusComment(comment)
{
    if (isNullOrBlankString(comment.body) || comment.body.length > 200)
        return false;
        
    return true;
}