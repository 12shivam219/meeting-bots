// frontend/src/components/MeetingForm.js
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DateTimePicker from 'react-datetime-picker';

const MeetingForm = ({ videos, onSubmit }) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Meeting name is required'),
    url: Yup.string().url('Invalid URL').required('Meeting URL is required'),
    videoId: Yup.string().required('Please select a video'),
    scheduledTime: Yup.date().required('Scheduled time is required').min(new Date(), 'Cannot schedule in the past'),
    duration: Yup.number().min(5, 'Minimum 5 minutes').max(240, 'Maximum 4 hours').required('Duration is required')
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Schedule New Meeting</h2>
      <Formik
        initialValues={{
          name: '',
          url: '',
          password: '',
          videoId: '',
          scheduledTime: new Date(),
          duration: 60
        }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Meeting Name</label>
                <Field type="text" name="name" className="w-full p-2 border rounded" />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Meeting URL</label>
                <Field type="text" name="url" className="w-full p-2 border rounded" />
                <ErrorMessage name="url" component="div" className="text-red-500 text-sm" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Password (if required)</label>
                <Field type="text" name="password" className="w-full p-2 border rounded" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Select Video</label>
                <Field as="select" name="videoId" className="w-full p-2 border rounded">
                  <option value="">Select a video</option>
                  {videos.map(video => (
                    <option key={video._id} value={video._id}>{video.name}</option>
                  ))}
                </Field>
                <ErrorMessage name="videoId" component="div" className="text-red-500 text-sm" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Scheduled Time</label>
                <DateTimePicker
                  onChange={val => setFieldValue('scheduledTime', val)}
                  value={values.scheduledTime}
                  className="w-full"
                  minDate={new Date()}
                />
                <ErrorMessage name="scheduledTime" component="div" className="text-red-500 text-sm" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <Field type="number" name="duration" className="w-full p-2 border rounded" />
                <ErrorMessage name="duration" component="div" className="text-red-500 text-sm" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};