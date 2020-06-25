exports.page404 = (req, res) => {
    res.status(404).render('404', { pageTitle: '404 | My Shop', pageURL: '', isAuthenticated: req.session.isLoggedin });
};