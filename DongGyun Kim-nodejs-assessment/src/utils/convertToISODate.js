const convertToISODate = (ukDateStr) => {
  const [day, month, year] = ukDateStr.split("/");
  return `${year}-${month}-${day}`;
};

export default convertToISODate;
