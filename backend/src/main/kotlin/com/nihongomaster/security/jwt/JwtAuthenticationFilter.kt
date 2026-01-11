package com.nihongomaster.security.jwt

import com.nihongomaster.security.UserPrincipal
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import mu.KotlinLogging
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

private val logger = KotlinLogging.logger {}

/**
 * JWT authentication filter that processes incoming requests.
 * Extracts JWT from Authorization header and sets Spring Security context.
 */
@Component
class JwtAuthenticationFilter(
    private val jwtService: JwtService
) : OncePerRequestFilter() {

    companion object {
        private const val AUTHORIZATION_HEADER = "Authorization"
        private const val BEARER_PREFIX = "Bearer "
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            val jwt = extractJwtFromRequest(request)

            if (jwt != null && jwtService.validateToken(jwt) && !jwtService.isRefreshToken(jwt)) {
                val userId = jwtService.getUserIdFromToken(jwt)
                val email = jwtService.getEmailFromToken(jwt)
                val role = jwtService.getRoleFromToken(jwt)

                if (userId != null && email != null && role != null) {
                    val authorities = listOf(SimpleGrantedAuthority("ROLE_$role"))

                    val principal = UserPrincipal(
                        id = userId,
                        email = email,
                        role = role
                    )

                    val authentication = UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        authorities
                    )
                    authentication.details = WebAuthenticationDetailsSource().buildDetails(request)

                    SecurityContextHolder.getContext().authentication = authentication
                    logger.debug { "Set authentication for user: $userId" }
                }
            }
        } catch (e: Exception) {
            logger.error { "Cannot set user authentication: ${e.message}" }
        }

        filterChain.doFilter(request, response)
    }

    private fun extractJwtFromRequest(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader(AUTHORIZATION_HEADER)
        return if (bearerToken != null && bearerToken.startsWith(BEARER_PREFIX)) {
            bearerToken.substring(BEARER_PREFIX.length)
        } else {
            null
        }
    }
}
