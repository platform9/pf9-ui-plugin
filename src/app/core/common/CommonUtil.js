import React from 'react'

// Seperating number with commas and add unit(optional) passed in
const formatedValue = (value,unit='') => {
  let res = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  if (unit.length>0) {
    res = res+' '+unit 
  }
  return res
}

// Transfer date obj into string like "Jan 1, 2018 12:10:24"
const formattedDate = (date) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const leadingzero = (str) => (('0'+str).slice(-2))
  return months[date.getMonth()]+" "+date.getDate()+","+date.getFullYear()+
  " "+leadingzero(date.getHours())+":"+leadingzero(date.getMinutes())+":"+
  leadingzero(date.getSeconds())
}

module.exports = {
  formatedValue,
  formatedDate
}