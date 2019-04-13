import {timeFormat, timeFormatDefaultLocale} from "d3-time-format";
import {
	timeSecond,
	timeMinute,
	timeHour,
	timeDay,
	timeWeek,
	timeMonth,
	timeYear
} from "d3-time";

timeFormatDefaultLocale({
	"dateTime": "%a %e %b %X %Y",
	"date": "%d/%m/%Y",
	"time": "%H:%M:%S",
	"periods": ["AM", "PM"],
	"days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	"shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	"months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	"shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});

const formatMillisecond = timeFormat(".%L");
const formatSecond = timeFormat(":%S");
const formatMinute = timeFormat("%H:%M");
const formatDay = timeFormat("%a %d");
const formatWeek = timeFormat("%b %d");
const formatMonth = timeFormat("%B");
const formatYear = timeFormat("%Y");

export default function(date)
{
	return (timeSecond(date) < date ? formatMillisecond
		: timeMinute(date) < date ? formatSecond
			: timeHour(date) < date ? formatMinute
				: timeDay(date) < date ? formatMinute
					: timeMonth(date) < date ? (timeWeek(date) < date ? formatDay : formatWeek)
						: timeYear(date) < date ? formatMonth
							: formatYear)(date);
}