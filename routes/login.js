exports.execute = function(req, res) {

    if (req.user)
    {
        if (req.param("currentPage") == "index")
            res.redirect('/');
        else if (req.param("currentPage") == "register")
            res.redirect("/register");
        else if (req.param("currentPage") == "users")
            res.redirect("/users/");
        else
            res.redirect("/users/"+req.param("currentPage"));
    }
    else
    {
        res.render('error', { loggedIn : false, currentUser : "", reason : 'Virheelliset kirjautumistunnukset' } );
    }
};

exports.failed = function(req, res) {
    res.render('error', { loggedIn : false, currentUser : "", reason : 'Virheelliset kirjautumistunnukset' } );
};