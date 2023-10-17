import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { loginUser } from '../../../_actions/user_action'
import { useNavigate } from "react-router-dom"
import Auth from "../../../hoc/auth"
import './Login.css'

const LoginPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [Email, setEmail] = useState("")
    const [Password, setPassword] = useState("")

    const onEmailHandler = (event) => {
        setEmail(event.currentTarget.value)
    }
    
    const onPasswordHandler = (event) => {
        setPassword(event.currentTarget.value)
    }
    
    const onSubmitHandler = (event) => {
        event.preventDefault()

        let body = {
            email: Email,
            password: Password
        }

        dispatch(loginUser(body))
            .then(response => {
                if (response.payload.loginSuccess) {
                    navigate(-1)
                } else {
                    alert('Login failed!!')
                }
            })
    }

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={onSubmitHandler}>
                <label htmlFor="email">Email</label>
                <input
                    type='email'
                    id="email"
                    value={Email}
                    onChange={onEmailHandler}
                />
                <label htmlFor="password">Password</label>
                <input
                    type='password'
                    id="password"
                    value={Password}
                    onChange={onPasswordHandler}
                />
                <button className="login-button" type="submit">
                    Login
                </button>
            </form>
        </div>
    )
}

export default Auth(LoginPage, false)
