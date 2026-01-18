export const helper = (today:Date)=>{
    
    let endOfWeek = new Date(today)
    let daysUntilSunday =( 7 - today.getDay()) % 7;
    endOfWeek.setDate(today.getDate()+daysUntilSunday)
    endOfWeek.setHours(23,59,59,999)
    return endOfWeek;
}