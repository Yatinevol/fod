export const helper = (today:Date)=>{
    
    const endOfWeek = new Date(today)
    const daysUntilSunday =( 7 - today.getDay()) % 7;
    endOfWeek.setDate(today.getDate()+daysUntilSunday)
    endOfWeek.setHours(23,59,59,999)
    return endOfWeek;
}