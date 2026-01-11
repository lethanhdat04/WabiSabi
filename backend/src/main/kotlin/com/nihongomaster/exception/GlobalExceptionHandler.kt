package com.nihongomaster.exception

import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.Instant

private val logger = KotlinLogging.logger {}

/**
 * Global exception handler for REST controllers.
 * Converts exceptions to consistent API error responses.
 */
@RestControllerAdvice
class GlobalExceptionHandler {

    /**
     * Handle validation errors from @Valid annotations.
     */
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationErrors(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val errors = ex.bindingResult.allErrors.associate { error ->
            val fieldName = (error as? FieldError)?.field ?: "unknown"
            fieldName to (error.defaultMessage ?: "Invalid value")
        }

        val errorResponse = ErrorResponse(
            status = HttpStatus.BAD_REQUEST.value(),
            error = "Validation Failed",
            message = "One or more fields have validation errors",
            errorCode = "VALIDATION_ERROR",
            details = errors
        )

        return ResponseEntity.badRequest().body(errorResponse)
    }

    /**
     * Handle API exceptions.
     */
    @ExceptionHandler(ApiException::class)
    fun handleApiException(ex: ApiException): ResponseEntity<ErrorResponse> {
        val status = when (ex) {
            is ResourceNotFoundException -> HttpStatus.NOT_FOUND
            is BadRequestException -> HttpStatus.BAD_REQUEST
            is UnauthorizedException -> HttpStatus.UNAUTHORIZED
            is ForbiddenException -> HttpStatus.FORBIDDEN
            is ConflictException -> HttpStatus.CONFLICT
            is InvalidCredentialsException -> HttpStatus.UNAUTHORIZED
            is InvalidTokenException -> HttpStatus.UNAUTHORIZED
            is EmailAlreadyExistsException -> HttpStatus.CONFLICT
            is UsernameAlreadyExistsException -> HttpStatus.CONFLICT
            else -> HttpStatus.INTERNAL_SERVER_ERROR
        }

        val errorResponse = ErrorResponse(
            status = status.value(),
            error = status.reasonPhrase,
            message = ex.message ?: "An error occurred",
            errorCode = ex.errorCode
        )

        return ResponseEntity.status(status).body(errorResponse)
    }

    /**
     * Handle Spring Security authentication exceptions.
     */
    @ExceptionHandler(BadCredentialsException::class)
    fun handleBadCredentials(ex: BadCredentialsException): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(
            status = HttpStatus.UNAUTHORIZED.value(),
            error = "Unauthorized",
            message = "Invalid email/username or password",
            errorCode = "INVALID_CREDENTIALS"
        )

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse)
    }

    /**
     * Handle access denied exceptions.
     */
    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDenied(ex: AccessDeniedException): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(
            status = HttpStatus.FORBIDDEN.value(),
            error = "Forbidden",
            message = "You don't have permission to access this resource",
            errorCode = "ACCESS_DENIED"
        )

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse)
    }

    /**
     * Handle all other unhandled exceptions.
     */
    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception): ResponseEntity<ErrorResponse> {
        logger.error(ex) { "Unhandled exception: ${ex.message}" }

        val errorResponse = ErrorResponse(
            status = HttpStatus.INTERNAL_SERVER_ERROR.value(),
            error = "Internal Server Error",
            message = "An unexpected error occurred",
            errorCode = "INTERNAL_ERROR"
        )

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse)
    }
}

/**
 * Standard error response format.
 */
data class ErrorResponse(
    val status: Int,
    val error: String,
    val message: String,
    val errorCode: String? = null,
    val details: Map<String, String>? = null,
    val timestamp: Instant = Instant.now()
)
