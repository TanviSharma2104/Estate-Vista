import React, { useState, useEffect } from 'react'
import {useDispatch, useSelector} from 'react-redux'
import { useRef } from 'react'
import {Link} from 'react-router-dom'
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage'
import {app} from '../firebase.js'
import {updateUserStart, updateUserSuccess, updateUserFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure, signOutUserStart, signOutUserSuccess, signOutUserFailure} from '../redux/user/userSlice'




export default function Profile() {
  const fileRef=useRef(null)
  const {currentUser, loading, error} = useSelector((state)=> state.user)

  const [file, setFile]=useState(undefined)
  const [filePerc, setFilePerc] = useState(0)
  const [fileError, setFileError] = useState(false)
  const [formData, setFormData] = useState({})
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [showListingError, setShowListingError] = useState(false)
  const [userListings, setUserListings] = useState([])
  
  const dispatch = useDispatch();

  // console.log(formData)
  // console.log("Upload is "+ filePerc+ "% done")

  useEffect(()=>{
    if(file){
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file)=>{
    const storage=getStorage(app);
    const fileName=new Date().getTime()+ file.name;
    const storageRef=ref(storage, fileName);
    const uploadTask=uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot)=>{
        const progress=(snapshot.bytesTransferred/ snapshot.totalBytes)*100;
        setFilePerc(Math.round(progress))
        

    },
    (error)=>{
      setFileError(true)
    },
    ()=>{
      getDownloadURL(uploadTask.snapshot.ref)
      .then((downloadURL)=>{
        setFormData({...formData, avatar:downloadURL})
      })
    });

  }

  const handleChange =(e)=>{
    setFormData({...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit=async(e)=>{
    e.preventDefault();
    try {

      dispatch(updateUserStart());
      const res=await fetch(`/server/user/update/${currentUser._id}`,
      { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json',},
        body:JSON.stringify(formData),
      });

      const data=await res.json();
      if(data.success===false){
        dispatch(updateUserFailure(data.message))
        console.log("not update")
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      // console.log("success");
      
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      
    }
  }

  const handleDeleteUser=async(e)=>{
    try {
      dispatch(deleteUserStart());

      const res=await fetch(`/server/user/delete/${currentUser._id}`,{
        method:'DELETE',
      })

      const data=await res.json();

      if(data.success===false){
        dispatch(deleteUserFailure(data.message));
        return;
      }

      dispatch(deleteUserSuccess(data));
      
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  }

  const handleSignOut=async()=>{
    try {
      dispatch(signOutUserStart());
      const res=await fetch(`/server/auth/signout`);
      const data=await res.json();
      if(data.success===false){
        dispatch(signOutUserFailure(data.message))
        return;
      }
      dispatch(signOutUserSuccess(data))
    } catch (error) {
      dispatch(signOutUserFailure(error.message))
      
    }
  }

  const handleShowListing=async()=>{
    try {
      setShowListingError(false)
      const res=await fetch(`/server/user/listings/${currentUser._id}`);
      const data=await res.json();
      if(data.success===false){
        setShowListingError(true);
        return;
      }

      setUserListings(data)
      
    } catch (error) {
      setShowListingError(true)
      
    }
  }

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input 
          onChange={(e)=>setFile(e.target.files[0])}  
          type="file" 
          ref={fileRef} 
          hidden 
          accept='image/*' />

        <img onClick={()=>fileRef.current.click()} src={formData.avatar || currentUser.avatar} alt='profile' className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2' />
        <p className='text-sm self-center'>
          {fileError ? 
            <span className='text-red-700'> Error Image upload (Image should be less than 2 mb)</span>
            : filePerc>0 && filePerc<100 
              ? ( <span className='text-slate-700'> {`Uploading ${filePerc} %`} </span>)
            : filePerc=== 100 ?
              (<span className='text-green-700'>Image Successfully uploaded! </span>): ("")

           }
        </p>
        <input type='text' id='username' placeholder='username' defaultValue={currentUser.username} onChange={handleChange} className='border p-3 rounded-lg' />
        <input type='email' id='email' placeholder='email' defaultValue={currentUser.email} onChange={handleChange} className='border p-3 rounded-lg' />
        <input type='password' id='password' placeholder='password' onChange={handleChange} className='border p-3 rounded-lg' />
        <button  disabled={loading} className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'>
          {loading? 'Loading...':'Update'}
        </button>

        <Link to={"/create-listing"} className='bg-green-700 text-white p-3 rounded-lg  uppercase text-center hover:opacity-90'>
          Create Listing
        </Link>

      </form>
      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer '>Delete Account</span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>Sign out</span>
      </div>

      <p className='text-red-700 mt-5'>{error? error: ""}</p>
      <p className='text-green-700 mt-5'>{updateSuccess? "User is updated successfully": ""}</p>

      <button onClick={handleShowListing} className='text-green-700 w-full'>Show Listings</button>
      <p className='text-red-700 mt-5'>{showListingError? 'Error showing listings':''}</p>

      { userListings && userListings.length>0 && 
        <div className="flex flex-col gap-4">
          <h1  className='text-center mt-7 text-2xl font-semibold'>Your Listings</h1>
          {userListings.map((listing)=>(
            <div key={listing._id} className='border gap-4 rounded-lg p-3 flex justify-between items-center'>
              <Link to={`/listing/${listing._id}`}> 
                <img src={listing.imageUrls[0]} alt="listing cover" className='h-16 w-16 object-contain' />
              </Link> 
  
              <Link to={`/listing/${listing._id}`}  className='flex-1 text-slate-700 font-semibold  hover:underline truncate'>
                <p > {listing.name}</p>
              </Link>
              <div className="flex flex-col items-center">
                <button className='text-red-700 uppercase'>Delete</button>
                <button className='text-green-700 uppercase'>Edit</button>
              </div>
              
            </div>
          ))}

        </div>
        }
    </div>
  )
}
