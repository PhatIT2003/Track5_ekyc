const handleSuccess = (message, data = null) => {
   return {
      success: true,
      message,
      ...(data !== null && { data }) 
   };
}

module.exports = handleSuccess
