import axios from 'axios';
import { useState } from 'react';

export default function PlaceBid({ token }) {
  const [jobId, setJobId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const submitBid = async () => {
    await axios.post('http://127.0.0.1:8000/api/bids/', {
      job: jobId,
      amount,
      message
    }, { headers: { Authorization: `Bearer ${token}` } });
    alert('Bid submitted!');
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-10 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Place Bid</h2>
      <input className="border p-2 w-full mb-2" placeholder="Job ID"
        onChange={e=>setJobId(e.target.value)}/>
      <input className="border p-2 w-full mb-2" placeholder="Amount"
        onChange={e=>setAmount(e.target.value)}/>
      <textarea className="border p-2 w-full mb-4" placeholder="Message"
        onChange={e=>setMessage(e.target.value)}></textarea>
      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={submitBid}>Submit</button>
    </div>
  );
}
