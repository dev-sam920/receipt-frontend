import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import { BarChart3, Wallet, FileText, Tags, Settings, Bell, Search, Cloud, Lock, Plus, Trash2, LogOut, Menu, X } from 'lucide-react'
import './Dashboard.css'
import { API_BASE_URL } from '../config'


const Dashboard = () => {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const [userName, setUserName] = useState(() => {
        try {
            return localStorage.getItem('receiptKeeperUser') || 'Alex Rivero'
        } catch (error) {
            console.error('Failed to load user', error)
            return 'Alex Rivero'
        }
    })
    const [userEmail, setUserEmail] = useState(() => {
        try {
            const email = localStorage.getItem('receiptKeeperUserEmail')
            console.log('Loaded userEmail from localStorage:', email)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
            return email || ''
        } catch (error) {
            console.error('Failed to load user email', error)
            return ''
        }
    })
    const [uploadedImages, setUploadedImages] = useState(() => {
        try {
            const saved = localStorage.getItem('receiptKeeperImages')
            const parsed = saved ? JSON.parse(saved) : []
            console.log('Loaded receipts from localStorage:', parsed.length, 'items')
            return parsed
        } catch (error) {
            console.error('Failed to load saved images from localStorage', error)
            return []
        }
    })
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        try {
            localStorage.setItem('receiptKeeperImages', JSON.stringify(uploadedImages))
            console.log('Saved receipts to localStorage:', uploadedImages.length, 'items')
        } catch (error) {
            console.error('Failed to save images to localStorage', error)
        }
    }, [uploadedImages])


    useEffect(() => {
        const loadReceipts = async () => {
            try {
                console.log('Loading receipts for userEmail:', userEmail)
                if (!userEmail) {
                    console.log('No user email available, using localStorage only')
                    return
                }

                try {
                    const response = await axios.get(`${API_BASE_URL}/api/receipts`, {
                        params: { email: userEmail }
                    })
                    const dbReceipts = response.data.map(receipt => ({
                        id: receipt._id,
                        name: receipt.name,
                        src: receipt.url,
                        url: receipt.url,
                        size: receipt.size,
                        type: receipt.type,
                        description: receipt.description,
                        public_id: receipt.public_id,
                        fromDatabase: true, 
                    }))
                    console.log('Loaded receipts from DB:', dbReceipts.length, 'items')

                    
                    const localReceipts = uploadedImages.filter(img => !img.fromDatabase)
                    const mergedReceipts = [...dbReceipts, ...localReceipts]

                    setUploadedImages(mergedReceipts)
                } catch (dbError) {
                    console.log('Database not available, using localStorage only')
                    
                }
            } catch (error) {
                console.error('Failed to load receipts:', error)
            }
        }
        loadReceipts()
    }, [userEmail])

    const refreshReceipts = async () => {
        try {
            if (!userEmail) return
            const response = await axios.get(`${API_BASE_URL}/api/receipts`, {
                params: { email: userEmail }
            })
            const receipts = response.data.map(receipt => ({
                id: receipt._id,
                name: receipt.name,
                src: receipt.url,
                url: receipt.url,
                size: receipt.size,
                type: receipt.type,
                description: receipt.description,
                public_id: receipt.public_id,
            }))
            setUploadedImages(receipts)
            console.log('Refreshed receipts from DB:', receipts)
        } catch (error) {
            console.error('Failed to refresh receipts', error)
        }
    }

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: BarChart3, active: true },
        { id: 'settings', label: 'Settings', icon: Settings, active: false },
    ]

    const handleLogout = () => {
        localStorage.removeItem('receiptKeeperUser')
        localStorage.removeItem('receiptKeeperUserEmail')
        localStorage.removeItem('receiptKeeperImages')
        navigate('/signin')
    }

    const handleAddReceipt = () => {
        if (!fileInputRef.current) {
            console.error('File input ref not found')
            return
        }

        fileInputRef.current.value = ''
        fileInputRef.current.click()
    }

    const handleFileChange = async (e) => {
        const files = e.target.files
        if (!files || files.length === 0) {
            console.log('No files selected')
            return
        }

        console.log('Files selected:', files)

        for (const file of Array.from(files)) {
            const formData = new FormData()
            formData.append('image', file)

            let imageUrl = null
            let publicId = null

            try {
                const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })

                imageUrl = response.data.url
                publicId = response.data.public_id

                if (!imageUrl) {
                    console.warn('Upload returned no URL; using local preview instead', response.data)
                }
            } catch (error) {
                console.error('Cloudinary upload failed:', error.response?.data || error.message)
            }

            if (!imageUrl) {
                imageUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onload = (event) => resolve(event.target?.result)
                    reader.onerror = reject
                    reader.readAsDataURL(file)
                })
            }

            
            const newReceipt = {
                id: Date.now() + Math.random(),
                name: file.name,
                src: imageUrl,
                url: imageUrl,
                size: file.size,
                type: file.type,
                description: '',
                public_id: publicId || null,
                fromDatabase: false, 
            }

          
            setUploadedImages((prev) => [...prev, newReceipt])

            
            if (userEmail && imageUrl) {
                try {
                    console.log('Current userEmail:', userEmail)
                    if (!userEmail) {
                        console.log('No user email, saving locally only')
                        return
                    }

                    const receiptData = {
                        name: file.name,
                        url: imageUrl,
                        public_id: publicId,
                        description: '',
                        size: file.size,
                        type: file.type,
                        email: userEmail,
                    }
                    console.log('Saving receipt to DB:', receiptData)
                    
                    const saveResponse = await axios.post(`${API_BASE_URL}/api/receipts`, receiptData)
                    console.log('Saved receipt to DB:', saveResponse.data)
                    
                    

                    setUploadedImages((prev) =>
                        prev.map((img) => 
                            img.id === newReceipt.id 
                                ? { ...img, id: saveResponse.data._id, fromDatabase: true }
                                : img
                        )
                    )
                } catch (error) {
                    console.error('Failed to save receipt to DB, keeping in localStorage:', error.response?.data || error.message)
                    
                }
            } else {
                console.log('Local preview, saved to localStorage only')
            }
        }
    }

    const deleteImage = async (id) => {
     
        const confirmDelete = window.confirm('Are you sure you want to delete this receipt?')

        if (!confirmDelete) {
            return 
        }

        
        setUploadedImages((prev) => prev.filter((img) => img.id !== id))

       
        try {
            await axios.delete(`${API_BASE_URL}/api/receipts/${id}`)
            console.log('Deleted receipt from DB')
        } catch (error) {
            console.error('Failed to delete receipt from DB (might not have been saved there):', error)
        }
    }

    const updateDescription = async (id, description) => {
       
        setUploadedImages((prev) =>
            prev.map((img) => (img.id === id ? { ...img, description } : img))
        )

       
        const image = uploadedImages.find(img => img.id === id)
        if (image && image.fromDatabase) {
            try {
                await axios.patch(`${API_BASE_URL}/api/receipts/${id}`, { description })
                console.log('Updated receipt description in DB')
            } catch (error) {
                console.error('Failed to update description in DB:', error)
            }
        } else if (image && !image.fromDatabase && image.url.startsWith('https://') && userEmail) {
            // Save local receipt to DB with description
            try {
                const receiptData = {
                    name: image.name,
                    url: image.url,
                    public_id: image.public_id,
                    description: description,
                    size: image.size,
                    type: image.type,
                    email: userEmail,
                }
                const saveResponse = await axios.post(`${API_BASE_URL}/api/receipts`, receiptData)
                console.log('Saved local receipt to DB:', saveResponse.data)
                
                setUploadedImages((prev) =>
                    prev.map((img) => 
                        img.id === id 
                            ? { ...img, id: saveResponse.data._id, fromDatabase: true, description }
                            : img
                    )
                )
            } catch (error) {
                console.error('Failed to save local receipt to DB:', error)
            }
        }
    }

    return (
        <div className="dashboard-container">

            <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-content">

                    <div className="logo-section">
                        <div className="logo">
                            <h1>Receipt <span className="logo-accent">Keeper</span></h1>
                            <p className="logo-subtitle"></p>
                        </div>
                    </div>


                    <nav className="menu">
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <a
                                    key={item.id}
                                    href="#"
                                    className={`menu-item ${item.active ? 'active' : ''}`}
                                >
                                    <Icon size={20} />
                                    <span>{item.label}</span>
                                </a>
                            )
                        })}
                    </nav>
                </div>


                <div className="sidebar-bottom">

                    <div className="user-profile">
                        <div className="avatar">{userName.split(' ').map((w) => w[0]).join('').toUpperCase()}</div>
                        <div className="user-info">
                            <p className="user-name">{userName}</p>

                        </div>
                    </div>

                    <button className="add-expense-btn" onClick={handleAddReceipt}>
                        <Plus size={18} />
                        <span>Add Expense</span>
                    </button>

                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {isMobileMenuOpen && <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}


            <main className="main-content">

                <header className="top-bar">
                    <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <h2>Dashboard</h2>
                    <div className="top-bar-right">
                        <div className="search-bar">
                            <Search size={18} />
                            <input type="text" placeholder="Search receipts…" />
                        </div>
                        <button className="notification-btn">
                            <Bell size={20} />
                        </button>
                    </div>
                </header>


                <div className="content-area">
                    {uploadedImages.length === 0 ? (
                        <div className="empty-state-container">
                            <div className="empty-state-card">

                                <div className="receipt-icon">
                                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                                        <rect x="30" y="15" width="60" height="90" rx="8" stroke="#0FA968" strokeWidth="2" fill="#F0FDF4" />
                                        <circle cx="60" cy="45" r="10" fill="#0FA968" />
                                        <line x1="45" y1="65" x2="75" y2="65" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
                                        <line x1="45" y1="75" x2="75" y2="75" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
                                        <line x1="45" y1="85" x2="65" y2="85" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>


                                <h3 className="empty-title">No receipts yet</h3>
                                <p className="empty-subtitle">Your uploaded receipts will appear here.</p>

                                <button className="primary-btn" onClick={handleAddReceipt}>
                                    <Plus size={18} />
                                    <span>Add your first receipt</span>
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />

                                <div className="features">
                                    <div className="feature">
                                        <Cloud size={16} />
                                        <span></span>
                                    </div>
                                    <div className="feature">
                                        <Lock size={16} />
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="receipts-container">
                            <div className="receipts-header">
                                <h3>Receipts ({uploadedImages.length})</h3>
                            </div>

                            <div className="receipts-grid">
                                {uploadedImages.map((image) => (
                                    <div key={image.id} className="receipt-card">
                                        <div className="receipt-image-wrapper">
                                            <img src={image.src} alt={image.name} />
                                        </div>
                                        <div className="receipt-info">
                                            <div className="receipt-details">
                                                <p className="receipt-name" title={image.name}>{image.name}</p>
                                                <input
                                                    type="text"
                                                    className="receipt-description-input"
                                                    placeholder="Add description..."
                                                    value={image.description}
                                                    onChange={(e) => updateDescription(image.id, e.target.value)}
                                                />
                                            </div>
                                            <button
                                                className="delete-receipt-btn"
                                                onClick={() => deleteImage(image.id)}
                                                title="Delete receipt"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="add-more-footer">
                                <button className="add-more-btn" onClick={handleAddReceipt}>
                                    <Plus size={16} />
                                    <span>Add More</span>
                                </button>
                            </div>


                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default Dashboard