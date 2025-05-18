import { onValue, ref, set, get, remove, push } from "firebase/database" ;
import { database } from '../firebaseConfig';

export const signUpUser = (user) => {
    return new Promise((resolve, reject) => {
        set(push(ref(database, 'users')), user).then(() => {
            resolve("Success");
            reject();
        });
    });
};

export const getAuthUserFromRealtimeDB = (uid) => {
    return new Promise(function(resolve, reject) {
        onValue(ref(database, '/users/'), (snapshot) => {
            if(snapshot.exists()) {
                let userFromDB = {};
                for (const key in snapshot.val()) {
                    const user = snapshot.val()[key];

                    if(user.userUID === uid) {
                        userFromDB = user;
                        userFromDB.id = key;
                        break;
                    }
                }

                resolve(userFromDB);
                reject();
            }
        });
    });
};

export const getAllUsers = () => {
    return new Promise((resolve, reject) => {
        get(ref(database, 'users'))
            .then((data) => {
                if(data.exists()) {
                    const availableUsers = Object.values(data.val()).map(u => { 
                        return { email: u.email, username: u.username }; 
                    });

                    resolve(availableUsers);
                    reject();
                }
        });
    });
};

export const getAllAuthUsers = () => {
    return new Promise((resolve, reject) => {
        get(ref(database, 'users'))
            .then((data) => {
                if(data.exists()) {
                    const availableUsers = Object.values(data.val()).map(u => { 
                        return { email: u.email, username: u.username, gender: u.gender, roles: u.roles, id: u.id, userUID: u.userUID }; 
                    });

                    resolve(availableUsers);
                    reject();
                }
        });
    });
};

export const removeUserFromDB = (id) => {
    return new Promise(function(resolve, reject) {
        remove(ref(database, "/users/" + id))
            .then(() => {
                resolve();
                reject();
        });
    });
}

export const changeUserEmailToDB = (user, newEmail) => {
    return new Promise(function(resolve, reject) {
        set(ref(database, "/users/" + user.id), {
            username: user.username,
            email: newEmail,
            roles: user.roles,
            accessToken: user.accessToken,
            userUID: user.userUID,
            avatar: user.avatar,
            recipes: user.recipes || [],
            gender: user.gender
        }).then(() => {
                resolve();
                reject();
        });
    });
}

export const updateUser = (user) => {
    return new Promise(function(resolve, reject) {
        set(ref(database, "/users/" + user.id), user)
            .then(() => {
                resolve();
                reject();
            });
    });
}


export const sendFeedback = (newFeedback) => {
    return new Promise((resolve, reject) => {
        set(push(ref(database, 'feedback')), newFeedback).then(() => {
            resolve("Success");
            reject();
        });
    });
};

export const getAllFeedbackFromRealtimeDB = (uid) => {
    return new Promise(function(resolve, reject) {
        onValue(ref(database, '/feedback/'), (data) => {
            if(data.exists()) {
                let arrayFromFeedback = [];
                if(data.exists()) {
                    for (const key in data.val()) {
                        let obj = data.val()[key];
                        obj.id = key;
                        arrayFromFeedback.push(obj);
                    }
                }
                resolve(arrayFromFeedback);
            } else {
                reject();
            }
        });
    });
};

export const setUserRatingToDB = (user) => {
    return new Promise(function(resolve, reject) {
        set(ref(database, "/users/" + user.id), user)
            .then(() => {
                resolve();
                reject();
            });
    });
};



export const userIsAuth = (user) => {
    if(user === null || user === undefined)
        return false;

    if(user.roles === null || user.roles === undefined)
        return false;

    if(user.roles.length <= 0)
        return false;

    return user.roles[0] === 'User';
}

export const userIsAdmin = (user) => {
    if(user === null || user === undefined)
        return false;

    if(user.roles === null || user.roles === undefined)
        return false;

    if(user.roles.length <= 1)
        return false;

    return user.roles[1] === 'Admin';
}








