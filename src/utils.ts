import * as vscode from 'vscode';
import { store } from './store';
import { API } from './api';

export const refreshHistoryList = async () => {
    if (await checkLogin()) {
        store.history = (await API.getHistory()).history.reverse();
    } else {
        store.history = [{}];
    }

};

export const refreshLoginStatus = async () => {
    store.isLogin = await checkLogin();
};

export const refreshLoginCredential = async (context: vscode.ExtensionContext) => {
    if (!(await checkLogin())) {
        context.globalState.update('email', undefined);
        context.globalState.update('password', undefined);
    }
};

export const checkLogin = async () => {
    return (await API.getMe()).status === 'ok';
};

export const login = async (context: vscode.ExtensionContext) => {
    const { type, email, password } = getLoginCredential(context);
    if (!email || !password) {
        vscode.window.showInformationMessage('Please enter your email and password to use HackMD extension!');
        return;
    }
    if (type === 'LDAP') {
        await API.loginLdap(email, password);
    } else {
        await API.login(email, password);
    }
    if (await checkLogin()) {
        store.isLogin = true;
        vscode.window.showInformationMessage('Successfully login!');
    } else {
        vscode.window.showInformationMessage('Wrong email or password, please enter again');
    }
};

export const getLoginCredential = (context: vscode.ExtensionContext) => {
    const type: string = context.globalState.get('login-type');
    const email: string = context.globalState.get('email');
    const password: string = context.globalState.get('password');
    return { type, email, password };
};
