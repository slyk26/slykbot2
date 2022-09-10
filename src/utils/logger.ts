import winston, { format } from 'winston';

export function getLoggerFor(label: string) {
	const level = process.env.NODE_ENV === 'development' ? 'debug' : 'info';
	return winston.createLogger({
		level: level,
		transports: [
			new winston.transports.Console({
				format: format.combine(
					format.timestamp({ format: 'DD.MM.YYYY HH:mm:ss' }),
					format.errors({ stack: true }),
					format.splat(),
					format.label(),
					format.colorize(),
					winston.format.label({
						label: label,
					}),
					winston.format.printf(info => `[${[info.timestamp]}][${info.level}][${info.label}] ${info.message}`)),
			}),
		],
	});
}
