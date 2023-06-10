import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { auth } from '../_actions/user_action'
import { useNavigate } from 'react-router-dom';

function Auth(SpecificComponent, option, adminRoute = null) {

    function AuthenticationCheck(props) {
        const navigate = useNavigate();
        const dispatch = useDispatch();

        useEffect(() => {
            dispatch(auth()).then((res) => {
                //로그인 하지 않은 상태
                if (!res.payload.isAuth) {
                    if (option) {
                        navigate('/login');
                    }
                } else {
                    //로그인 한 상태
                    if (adminRoute && !res.payload.isAdmin) {
                        navigate('/')
                    } else {
                        if (option === false)
                            navigate('/')
                    }
                }
            }
            );
            // eslint-disable-next-line
        }, []);

        return <SpecificComponent />;
    }

    return AuthenticationCheck;
}
export default Auth;