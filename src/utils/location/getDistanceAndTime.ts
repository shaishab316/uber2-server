// import axios from 'axios';
// import config from '../../config';
// import { VehicleType } from './getNearestDriver';
// import { TLocation } from '../../../prisma';

// export default async function getDistanceAndTime(
//   origin: TLocation['geo'],
//   destination: TLocation['geo'],
//   vehicleType: VehicleType = 'driving',
// ) {
//   const { data } = await axios.get(
//     `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(
//       `${origin[1]},${origin[0]}`,
//     )}&destinations=${encodeURIComponent(`${destination[1]},${destination[0]}`)}&key=${config.google_map_key}&mode=${vehicleType}`,
//   );

//   return {
//     distance: data?.rows[0]?.elements[0]?.distance,
//     duration: data?.rows[0]?.elements[0]?.duration,
//   };
// }
