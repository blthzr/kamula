exports.execute = function(req, res) {

    req.session.destroy(function (err) {
        if (req.param("currentPage") == "index")
            res.redirect('/');
        else if (req.param("currentPage") == "register")
            res.redirect("/register");
        else if (req.param("currentPage") == "users")
            res.redirect("/users/");
        else
            res.redirect("/users/"+req.param("currentPage"));
    });
};