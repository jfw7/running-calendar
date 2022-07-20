import http from 'http';
import ical from 'ical-generator';
import { JSDOM } from 'jsdom';
import { parseDate } from 'chrono-node';


const response = await fetch('http://runnersworld.com/uk/a760131');
const body = await response.text();
const { window: { document } } = new JSDOM(body);

const calendar = ical({ name: 'Marathon Training' });
calendar.events(
  [...document.querySelectorAll('.body-h3 ~ .body-text')]
    .map(el => el.textContent.split(' '))
    .map(([day, ...rest]) => ({ day, run: rest.join(' ') }))
    .filter(({ day }) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].includes(day))
    .reduce((acc, { day, run }) => [{ date: parseDate(day, acc[0]?.date ?? 'last week'), run }, ...acc], [])
    .map(({ date: start, run: summary }) => ({ start, summary, allDay: true }))
);

http.createServer((req, res) => calendar.serve(res))
  .listen(3000, '127.0.0.1', () => {
    console.log('Server running at http://127.0.0.1:3000/');
  });
