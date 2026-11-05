# Generated from Jira DS-263: Delete and edit icons clipped off-screen when program row is selected
# UI verified on 2026-11-05 against https://test.didaxis.studio (Playwright CLI explore)
# Locator hints: Delete button role=button name="Delete {programName}"; Edit similarly named
# Program list card: Mantine Card with overflow:hidden; card right ≈ 620px at Desktop Chrome 1280
# Review before automating.

Feature: DS-263 Edit and delete icons reachable when program row is selected

  # Happy paths

  Scenario: Selected program row keeps edit and delete icons inside the list card
    Given an admin is on the Programs page with program "DS263 Clip Probe" in the list
    When the admin clicks the row for "DS263 Clip Probe" to select it
    And the admin hovers that row
    Then the Delete button for "DS263 Clip Probe" is visible
    And the Delete button's bounding box lies within the program list card (not clipped by overflow:hidden)
    And the Edit button for the program is similarly reachable inside the card

  # Negative

  Scenario: Selected row must not push action icons past the card edge
    Given an admin has selected program "DS263 Clip Probe"
    When the row is hovered
    Then the Delete button right edge is less than or equal to the list card right edge

  # Edge cases

  Scenario: Unselected hover still shows reachable delete icon (workaround baseline)
    Given an admin is on the Programs page with program "DS263 Clip Probe" in the list
    And no program row is selected (or a different row is selected)
    When the admin hovers "DS263 Clip Probe" without clicking it
    Then the Delete button is visible inside the list card

# ---
# Ambiguities / gaps (resolve before automation):
# - Ticket metrics (deleteButtonX=663 vs cardRight=620) did not reproduce on 2026-11-05 Desktop Chrome
#   1280px explore: delete at x=587, cardRight=620, visible=true when selected+hovered.
# - Assert geometric containment (button within card) rather than invented pixel constants from the ticket.
# - If bug is viewport-dependent, pin viewport in the test (e.g. 1280x720) and document.
# UI verification summary: Playwright CLI; selected+hover delete inside card in this env; ticket still open.
