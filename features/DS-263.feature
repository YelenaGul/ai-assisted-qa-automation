# Generated from Jira DS-263: Delete and edit icons clipped off-screen when program row is selected
# UI verified on 2026-11-05 against test.didaxis.studio (Playwright CLI + storageState).
# Review before automating.
#
# Locator hints:
# - Program list lives in a Mantine Card (overflow:hidden), panel right ≈ 620px at 1280px viewport.
# - Row actions: buttons "Edit {name}" and "Delete {name}".
# - Without hover, action buttons render far off-canvas (x≈18000+) — hover reveals them.
# - Observed 2026-11-05: after select + hover, Delete ≈ x=587 (inside panel). Ticket reported select+hover at x≈663 (clipped); re-verify geometry in the automated assertion.
# - Confirm copy when delete is reachable: Delete program "{name}"? All its semesters and courses will be removed. This cannot be undone.

Feature: DS-263 Edit and delete actions reachable on a selected program row

  # Happy paths

  Scenario: Selected program row shows edit and delete inside the list panel on hover
    Given I am signed in as an admin on the Programs page
    And a program named "Clip Probe" exists in the list
    When I click the "Clip Probe" row to select it
    And I hover the "Clip Probe" row
    Then the "Edit Clip Probe" button is within the visible program-list card bounds
    And the "Delete Clip Probe" button is within the visible program-list card bounds

  # Negative

  Scenario: Delete on a selected hovered row still opens the confirmation dialog
    Given I am signed in as an admin on the Programs page
    And a program named "Clip Probe" exists in the list
    When I click the "Clip Probe" row to select it
    And I hover the "Clip Probe" row
    And I click "Delete Clip Probe"
    Then a native confirmation dialog appears identifying "Clip Probe"
    And dismissing it keeps "Clip Probe" in the list

  # Edge cases

  Scenario: Unselected hovered row also keeps delete inside the list panel
    Given I am signed in as an admin on the Programs page
    And a program named "Clip Probe" exists in the list
    And a different program is selected (or none)
    When I hover the "Clip Probe" row without selecting it
    Then the "Delete Clip Probe" button is within the visible program-list card bounds

# ---
# Ambiguities / gaps (resolve before automation):
# - AC allows "on hover or always visible". Automation asserts visibility-within-panel after hover (selected and unselected).
# - Exact panel locator: nearest overflow:hidden Mantine Card ancestor of the programs table. Assert button.getBoundingClientRect().right <= card.right (+1px tolerance).
# - Ticket metrics (deleteX=663 clipped) may differ from current env (deleteX=587 inside). Geometry assertion is the source of truth; if it fails, classify as app bug (this ticket).
