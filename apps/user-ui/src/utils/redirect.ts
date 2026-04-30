let rediectToLogin = () => {
    window.location.href = '/login';
}

export const setRedirectHandler = (handler: () => void) => {
    rediectToLogin = handler;
}

export const runRediectToLogin = () => {
    rediectToLogin();
}