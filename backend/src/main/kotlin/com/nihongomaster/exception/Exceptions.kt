package com.nihongomaster.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

/**
 * Base exception for application-specific errors.
 */
open class ApiException(
    message: String,
    val errorCode: String? = null,
    cause: Throwable? = null
) : RuntimeException(message, cause)

/**
 * Exception for resource not found (404).
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
class ResourceNotFoundException(
    message: String,
    errorCode: String = "RESOURCE_NOT_FOUND"
) : ApiException(message, errorCode)

/**
 * Exception for bad request (400).
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
class BadRequestException(
    message: String,
    errorCode: String = "BAD_REQUEST"
) : ApiException(message, errorCode)

/**
 * Exception for unauthorized access (401).
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
class UnauthorizedException(
    message: String,
    errorCode: String = "UNAUTHORIZED"
) : ApiException(message, errorCode)

/**
 * Exception for forbidden access (403).
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
class ForbiddenException(
    message: String,
    errorCode: String = "FORBIDDEN"
) : ApiException(message, errorCode)

/**
 * Exception for conflict/duplicate resource (409).
 */
@ResponseStatus(HttpStatus.CONFLICT)
class ConflictException(
    message: String,
    errorCode: String = "CONFLICT"
) : ApiException(message, errorCode)

/**
 * Exception for invalid credentials during authentication.
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
class InvalidCredentialsException(
    message: String = "Invalid email/username or password",
    errorCode: String = "INVALID_CREDENTIALS"
) : ApiException(message, errorCode)

/**
 * Exception for expired or invalid tokens.
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
class InvalidTokenException(
    message: String = "Invalid or expired token",
    errorCode: String = "INVALID_TOKEN"
) : ApiException(message, errorCode)

/**
 * Exception for duplicate email during registration.
 */
@ResponseStatus(HttpStatus.CONFLICT)
class EmailAlreadyExistsException(
    message: String = "Email already registered",
    errorCode: String = "EMAIL_EXISTS"
) : ApiException(message, errorCode)

/**
 * Exception for duplicate username during registration.
 */
@ResponseStatus(HttpStatus.CONFLICT)
class UsernameAlreadyExistsException(
    message: String = "Username already taken",
    errorCode: String = "USERNAME_EXISTS"
) : ApiException(message, errorCode)
