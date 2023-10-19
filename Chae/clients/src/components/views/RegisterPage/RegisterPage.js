import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { registerUser } from '../../../_actions/user_action'
import { useNavigate } from "react-router-dom"
import Auth from "../../../hoc/auth"
import './Register.css'

const RegisterPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [Email, setEmail] = useState("")
    const [Name, setName] = useState("")
    const [Password, setPassword] = useState("")
    const [Confirm_Password, setConfirm_Password] = useState("")
    const [Phone, SetPhone] = useState("")

    const onEmailHandler = (event) => {
        setEmail(event.currentTarget.value)
    }

    const onNameHandler = (event) => {
        setName(event.currentTarget.value)
    }

    const onPasswordHandler = (event) => {
        setPassword(event.currentTarget.value)
    }

    const onConfirm_PasswordHandler = (event) => {
        setConfirm_Password(event.currentTarget.value)
    }

    const PhoneHandler = (event) => {
        SetPhone(event.currentTarget.value)
    }

    const onSubmitHandler = (event) => {
        event.preventDefault()

        if (Password !== Confirm_Password) {
            return alert("비밀번호와 비밀번호 확인은 같아야 합니다.")
        }

        let body = {
            email: Email,
            name: Name,
            password: Password
        }

        dispatch(registerUser(body))
            .then(response => {
                if (response.payload.success) {
                    navigate('/login')
                } else {
                    alert('회원가입 실패!!')
                }
            })
    }

    return (
        <div className="register-container">
            <form className="register-form" onSubmit={onSubmitHandler}>
                <label htmlFor="email">Email</label>
                <input
                    type='email'
                    id="email"
                    value={Email}
                    onChange={onEmailHandler}
                />
                <label htmlFor="name">Name</label>
                <input
                    type='text'
                    id="name"
                    value={Name}
                    onChange={onNameHandler}
                />
                <label htmlFor="password">Password</label>
                <input
                    type='password'
                    id="password"
                    value={Password}
                    onChange={onPasswordHandler}
                />
                <label htmlFor="confirm_password">Confirm Password</label>
                <input
                    type='password'
                    id="confirm_password"
                    value={Confirm_Password}
                    onChange={onConfirm_PasswordHandler}
                />
                <label htmlFor="phone">Phone</label>
                <input
                    type='tel'
                    id="phone"
                    value={Phone}
                    onChange={PhoneHandler}
                />
                <button className="register-button" type="submit">
                    회원가입
                </button>
            </form>
        </div>
    )
}

export default Auth(RegisterPage, false)
