'use client'
import { useState } from "react"

export default function Books() {
    const [bookname, setbookname] = useState('')
    const [barcode, setbarcode] = useState('')
    const [message, setMessage] = useState('')

    const handlesave = async () => {
        if (!bookname || !barcode) {
            setMessage('Please fill in both fields.')
            return
        }

        try {
            const response = await fetch('/api/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: bookname,
                    qr_code: barcode,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                setMessage('Book added successfully!')
                setbookname('')
                setbarcode('')
            } else {
                const error = await response.json()
                setMessage(error.error || 'Failed to add book.')
            }
        } catch (error) {
            setMessage('An error occurred.')
        }
    }

    return (
        <div>
            <h1>This is page for adding new book</h1>

            <div>
                <label htmlFor="bookname">Book name: </label>
                <input className="border border-1 border-black" type="text" name="bookname" id="bookname" value={bookname} onChange={(e) => setbookname(e.target.value)} />
            </div>

            <div>
                <label htmlFor="barcode">Full barcode: </label>
                <input className="border border-1 border-black" type="text" name="barcode" id="barcode" value={barcode} onChange={(e) => setbarcode(e.target.value)} />
            </div>

            <div>
                <button onClick={handlesave}>Save</button>
            </div>

            {message && <p>{message}</p>}
        </div>
    )
}
