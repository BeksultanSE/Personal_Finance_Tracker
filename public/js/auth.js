const logout = async () => {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            window.location.href = '/';
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Logout failed:', error);
    }
};



const checkAuth = async () => {
    try {
        const response = await fetch('/api/auth/refresh', {
            method: 'GET'
        });
        console.log(response);
        if (response.ok) {
            
        } else {
            showToast("You are not authorized for this app.", "danger");
            //alert("You are not authorized for this app.");
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
    }
}