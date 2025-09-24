export const statuses = [
  {
    label: 'Active',
    value: '1',
    description: 'Advertisement is running and sending to users',
    color: 'green',
    icon: 'Play',
  },
  {
    label: 'Inactive',
    value: '0',
    description: 'Advertisement is paused and not sending',
    color: 'gray',
    icon: 'Pause',
  },
  {
    label: 'Expired',
    value: '2',
    description: 'Advertisement has passed its end date',
    color: 'red',
    icon: 'Clock',
  },
]

export const frequencyOptions = [
  { label: '1 minute', value: '1' },
  { label: '3 minutes', value: '3' },
  { label: '5 minutes', value: '5' },
  { label: '10 minutes', value: '10' },
  { label: '15 minutes', value: '15' },
  { label: '30 minutes', value: '30' },
  { label: '60 minutes', value: '60' },
  { label: '120 minutes', value: '120' },
  { label: '240 minutes', value: '240' },
  { label: '480 minutes', value: '480' },
]

export const storeTypes = [
  {
    label: 'All Stores',
    value: 'all',
  },
  {
    label: 'No Store',
    value: 'none',
  },
]