import { redirect } from 'next/navigation';

// Redirect /career-path to the default career (Solar PV Technician)
export default function CareerPathIndexPage() {
  redirect('/career-path/c-01');
}
