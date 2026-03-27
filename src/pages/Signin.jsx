import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import './Signin.css'
import { API_BASE_URL } from '../config'

const Signin = () => {
    const navigate = useNavigate()
    const [email, setMail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({})
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => {
                setShowSuccess(false)
                navigate('/dashboard')
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [showSuccess, navigate])

    const handleChange = (e) => {
        const { id, value } = e.target

        if (id === 'email') setMail(value)
        if (id === 'password') setPassword(value)


        if (errors[id]) {
            setErrors(prev => ({
                ...prev,
                [id]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!email.trim()) {
            newErrors.email = 'Email address is required'
        }
        if (!password.trim()) {
            newErrors.password = 'Password is required'
        }

        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const newErrors = validateForm()

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
        } else {
            setErrors({})
            const userData = { email, password }
            try {
                const response = await axios.post(`${API_BASE_URL}/api/signin`, userData)
                console.log('Signin successful:', response.data)

                localStorage.setItem('receiptKeeperUser', response.data.user.name)
                setShowSuccess(true)

                setMail('')
                setPassword('')
            } catch (error) {
                console.error('Signin failed:', error.response?.data || error.message)
                setErrors({ form: error.response?.data?.message || 'Signin failed' })
            }
        }
    }

    return (
        <>
            {showSuccess && (
                <div className="modal-overlay">
                    <div className="success-modal">
                        <div className="success-icon">✓</div>
                        <h2 className="success-title">Signed In Successfully!</h2>
                        <p className="success-message">Welcome back! You logged in successfully.</p>
                    </div>
                </div>
            )}
            <div id="app-root">
                <div className="bg-glow-1"></div>
                <div className="bg-glow-2"></div>
                <div className="bg-overlay"></div>
                <div className="bg-lines">
                    <div className="bg-line-1"></div>
                    <div className="bg-line-2"></div>
                </div>


                <header className="header-title">
                    <h1>Receipt Keeper</h1>
                </header>


                <main className="signup-card">
                    <div className="card-header">
                        <h2 className="card-title">Welcome Back</h2>
                        <p className="card-subtitle">Sign in to your account</p>
                    </div>

                    {Object.keys(errors).length > 0 && (
                        <div className="error-banner">
                            {Object.entries(errors).map(([field, message]) =>
                                message && <div key={field} className="error-message">{message}</div>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label className="form-label" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                className="form-input"
                                value={email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">
                                Password
                            </label>
                            <div className="password-wrapper">
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="form-input"
                                    value={password}
                                    onChange={handleChange}
                                />
                                <button type="button" className="password-toggle">
                                </button>
                            </div>
                        </div>


                        <button type="submit" className="submit-btn">
                            Sign In
                        </button>
                    </form>

                    <div className="card-footer">
                        <p className="footer-text">
                            Don't have an account? <button onClick={() => navigate('/signup')} className="login-link">Sign up</button>
                        </p>
                    </div>
                </main>


            </div>



        </>
    )
}

export default Signin
