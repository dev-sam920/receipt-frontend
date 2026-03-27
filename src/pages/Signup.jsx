import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import './Signup.css'
import { API_BASE_URL } from '../config'

const Signup = () => {
    const navigate = useNavigate()
    const [fullname, setName] = useState('')
    const [email, setMail] = useState('')
    const [password, setPassword] = useState('')
    const [terms, setTerms] = useState(false)
    const [errors, setErrors] = useState({})
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => {
                setShowSuccess(false)
                navigate('/signin')
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [showSuccess, navigate])

    const handleChange = (e) => {
        const { id, type, value, checked } = e.target

        if (id === 'fullname') setName(value)
        if (id === 'email') setMail(value)
        if (id === 'password') setPassword(value)
        if (id === 'terms') setTerms(checked)


        if (errors[id]) {
            setErrors(prev => ({
                ...prev,
                [id]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!fullname.trim()) {
            newErrors.fullname = 'Full name is required'
        }
        if (!email.trim()) {
            newErrors.email = 'Email address is required'
        }
        if (!password.trim()) {
            newErrors.password = 'Password is required'
        }
        if (!terms) {
            newErrors.terms = 'You must agree to the terms'
        }

        const signupCredentials = localStorage.getItem('signupCredentials')
        if (signupCredentials) {
            try {
                const existing = JSON.parse(signupCredentials)
                if (existing.email && existing.email === email.trim()) {
                    newErrors.email = 'Account already exists with this email'
                }
            } catch (error) {
                console.error('Invalid signup credentials in localStorage', error)
            }
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
            const userData = { name: fullname, email, password }
            try {
                const response = await axios.post(`${API_BASE_URL}/api/signup`, userData)
                console.log('Signup successful:', response.data)
                setShowSuccess(true)

                setName('')
                setMail('')
                setPassword('')
                setTerms(false)
            } catch (error) {
                console.error('Signup failed:', error.response?.data || error.message)
                setErrors({ form: error.response?.data?.message || 'Signup failed' })
            }
        }
    }

    return (
        <>
            {showSuccess && (
                <div className="modal-overlay">
                    <div className="success-modal">
                        <div className="success-icon">✓</div>
                        <h2 className="success-title">Account Created Successfully!</h2>
                        <p className="success-message">Your account has been created. Welcome!</p>
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
                        <h2 className="card-title">Create Account</h2>
                        <p className="card-subtitle">Keep your Receipts safe.</p>
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
                            <label className="form-label" htmlFor="fullname">
                                Full Name
                            </label>
                            <input
                                id="fullname"
                                type="text"
                                placeholder="Enter your full name"
                                className="form-input"
                                value={fullname}
                                onChange={handleChange}
                            />
                        </div>


                        <div className="form-group">
                            <label className="form-label" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your gmail"
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

                        <div className="terms-container">
                            <label className="custom-checkbox">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={terms}
                                    onChange={handleChange}
                                />
                                <span className="checkmark"></span>
                            </label>
                            <label htmlFor="terms" className="terms-label">
                                I agree to the <a href="#" className="terms-link">Terms of Service</a> and <a href="" className="terms-link">Privacy Policy</a>.
                            </label>
                        </div>


                        <button type="submit" className="submit-btn">
                            Create Account
                        </button>
                    </form>

                    <div className="card-footer">
                        <p className="footer-text">
                            Already have an account? <button onClick={() => navigate('/signin')} className="login-link">Log in</button>
                        </p>
                    </div>
                </main>


            </div>



        </>
    )
}

export default Signup
